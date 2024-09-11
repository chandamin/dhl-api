import React, { useState, useEffect, useCallback } from 'react';
import { Page, Button, Card, TextField, Text as PageText, Spinner, Icon, Select } from '@shopify/polaris';
import { CaretUpIcon, CaretDownIcon } from '@shopify/polaris-icons';
import saveAs from 'file-saver';
import MyDocument from './MyDocument';
import { pdf } from '@react-pdf/renderer';
import { generateBarcodeBase64 } from './util/barcodeUtils';
import { useLoaderData } from '@remix-run/react';
import { json } from '@remix-run/react';
import shopify from '../shopify.server';

export async function loader({ request }) {
    const { admin, session } = await shopify.authenticate.admin(request);
    const data = await admin.rest.resources.Order.all({ session: session, status: "any", });
    return json(data.data[0]);
}

// Component to generate and download the PDF
export default function GenerateWaybill() {
    const order = useLoaderData();
    console.log(order);


    const [response, setResponse] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');
    const [barcodeImageUrl, setBarcodeImageUrl] = useState('');
    const [jwtToken, setJwtToken] = useState('');
    const [loading, setLoading] = useState(false);
    const [creditReferenceNo, setCreditReferenceNo] = useState('');
    const clientID = '5jRX1SsJtBujJ2YozVldsGJYd0WgmEQG';
    const clientSecret = 'comCncWQyG5sYERR';
    const [selected, setSelected] = useState('D');

    const internationalItemDetails = order.line_items.map((item, index) => ({
        "CGSTAmount": 0.0,
        "CommodityCode": "FOODSTUFF",  // This can be dynamic if needed
        "Discount": 0.0,
        "HSCode": item.hs_code || "95059090",  // Assuming HSCode can be derived from the item
        "IGSTAmount": 0.0,
        "IGSTRate": 0.0,
        "Instruction": "",
        "InvoiceDate": `/Date(${new Date(order.created_at).getTime()})/`,
        "InvoiceNumber": order.order_number.toString(),
        "IsMEISS": "0",
        "ItemID": index.toString(),  // Using index instead of item.id for dynamic values
        "ItemName": item.name || "N/A",  // Name from item data
        "ItemValue": parseFloat(item.price),  // Price from item data
        "Itemquantity": item.quantity,  // Quantity from item data
        "LicenseNumber": "",  // Can be filled if available
        "ManufactureCountryCode": "IN",  // For international, usually "IN" for India
        "ManufactureCountryName": "India",  // Assuming this for the item
        "PerUnitRate": parseFloat(item.price),  // Price per unit
        "PieceID": (index + 1).toString(),  // Sequential ID for each piece
        "PieceIGSTPercentage": 0.0,
        "PlaceofSupply": "",  // Can be left blank unless needed
        "ProductDesc1": item.title || "Others",  // Description from item data
        "ProductDesc2": "",  // Optional additional description
        "ReturnReason": "",  // Can be filled dynamically if needed
        "SGSTAmount": 0.0,
        "SKUNumber": item.sku || "SKU1771",  // SKU from item data, if available
        "SellerGSTNNumber": "",  // Seller GSTN, can be added dynamically
        "SellerName": "",  // Seller name, can be added dynamically
        "TaxableAmount": parseFloat(item.price) * item.quantity,  // Total taxable amount
        "TotalValue": parseFloat(item.price) * item.quantity,  // Total value
        "Unit": "PCS",  // Default unit as "PCS" (pieces)
        "Weight": item.grams / 1000,  // Assuming weight is in grams, convert to kg
        "cessAmount": "0.0",
        "countryOfOrigin": "IN"  // Assuming the origin is India
    }));
    

    const itemDetails = order.line_items.map(item => ({
        CGSTAmount: 0,
        HSCode: "", // Assuming no HS Code provided
        IGSTAmount: 0,
        IGSTRate: 0,
        Instruction: "",
        InvoiceDate: `/Date(${new Date(order.created_at).getTime()})/`,
        InvoiceNumber: order.order_number.toString(),
        ItemID: item.id.toString(),
        ItemName: item.name,
        ItemValue: parseFloat(item.price),
        Itemquantity: item.quantity,
        PlaceofSupply: order.billing_address.city || order.billing_address.city,
        ProductDesc1: item.title,
        ProductDesc2: item.variant_title,
        ReturnReason: "",
        SGSTAmount: 0,
        SKUNumber: item.sku || "",
        SellerGSTNNumber: "", // Assuming no GST Number provided
        SellerName: "", // Assuming no Seller Name provided
        TaxableAmount: parseFloat(item.price),
        TotalValue: parseFloat(item.price) * item.quantity,
        cessAmount: "0.0",
        countryOfOrigin: "IN",
        docType: "INV",
        subSupplyType: 1,
        supplyType: "0"
    }));


    useEffect(() => {
        const fetchToken = async () => {
            try {
                const res = await fetch('https://apigateway-sandbox.bluedart.com/in/transportation/token/v1/login', {
                    method: 'GET',
                    headers: {
                        'accept': 'application/json',
                        'ClientID': clientID,
                        'clientSecret': clientSecret,
                    }
                });

                const data = await res.json();
                if (data && data.JWTToken) {
                    setJwtToken(data.JWTToken);
                } else {
                    console.error('Failed to generate JWT token:', data);
                }
            } catch (error) {
                console.error('Error generating JWT token:', error);
            }
        };

        fetchToken();
    }, []);
    const fetchWaybill = async () => {
        if (!jwtToken) {
            setErrorMessage('JWT token is not available.');
            return;
        }

        const InternationalData = {
            "Request": {
                "Consignee": {
                    "AvailableDays": "",
                    "AvailableTiming": "",
                    "ConsigneeAddress1": order.billing_address.address1 || order.shipping_address.address1 || "N/A",
                    "ConsigneeAddress2": order.billing_address.address2 || order.shipping_address.address2 || "N/A",
                    "ConsigneeAddress3": order.billing_address.city || order.shipping_address.city || "N/A",
                    "ConsigneeAddressType": "",
                    "ConsigneeAddressinfo": "",
                    "ConsigneeAttention": `${order.billing_address.first_name || order.shipping_address.first_name} ${order.billing_address.last_name || order.shipping_address.last_name}` || "N/A",
                    "ConsigneeBusinessPartyTypeCode": "",
                    "ConsigneeCityName": order.billing_address.city || order.shipping_address.city || "N/A",
                    "ConsigneeCountryCode": order.billing_address.country_code || order.shipping_address.country_code || "N/A",
                    "ConsigneeEmailID": order.customer.email || "N/A",
                    "ConsigneeFiscalID": "",
                    "ConsigneeFiscalIDType": "",
                    "ConsigneeFullAddress": "",
                    "ConsigneeGSTNumber": "",
                    "ConsigneeID": order.customer.id || "N/A",
                    "ConsigneeIDType": "",
                    "ConsigneeLatitude": "",
                    "ConsigneeLongitude": "",
                    "ConsigneeMaskedContactNumber": "",
                    "ConsigneeMobile": order.billing_address.phone || order.shipping_address.phone || "+919999999999",
                    "ConsigneeName": `${order.billing_address.first_name || order.shipping_address.first_name} ${order.billing_address.last_name || order.shipping_address.last_name}` || "N/A",
                    "ConsigneePincode": order.billing_address.zip || order.shipping_address.zip || "N/A",
                    "ConsigneeStateCode": order.billing_address.province_code || order.shipping_address.province_code || "N/A",
                    "ConsigneeTelephone": order.billing_address.phone || order.shipping_address.phone || "+919999999999",
                    "ConsingeeFederalTaxId": "",
                    "ConsingeeRegistrationNumber": "",
                    "ConsingeeRegistrationNumberIssuerCountryCode": "",
                    "ConsingeeRegistrationNumberTypeCode": "",
                    "ConsingeeStateTaxId": ""
                },
                "Services": {
                    "AWBNo": "",
                    "ActualWeight": "0.50",
                    "AdditionalDeclaration": "",
                    "AuthorizedDealerCode": "6390948XXXXXXX",
                    "BankAccountNumber": "",
                    "BillToAddressLine1": "",
                    "BillToCity": "",
                    "BillToCompanyName": "",
                    "BillToContactName": "",
                    "BillToCountryCode": "",
                    "BillToCountryName": "",
                    "BillToFederalTaxID": "",
                    "BillToPhoneNumber": "",
                    "BillToPostcode": "",
                    "BillToState": "",
                    "BillToSuburb": "",
                    "BillingReference1": "",
                    "BillingReference2": "",
                    "CessCharge": 0.0,
                    "CollectableAmount": 0.0,
                    "Commodity": {
                        "CommodityDetail1": "5011100014",
                        "CommodityDetail2": "5011100014",
                        "CommodityDetail3": "5011100014"
                    },
                    "CreditReferenceNo": creditReferenceNo,
                    "CreditReferenceNo2": "",
                    "CreditReferenceNo3": "",
                    "CurrencyCode": order.currency || "USD",
                    "DeclaredValue": parseFloat(order.current_total_price),
                    "DeliveryTimeSlot": "",
                    "Dimensions": [
                        {
                            "Breadth": 10,
                            "Count": order.line_items.length.toString(),
                            "Height": 10,
                            "Length": 10
                        }
                    ],
                    "ECCN": "",
                    "EsellerPlatformName": "",
                    "ExchangeWaybillNo": "",
                    "ExportImportCode": "1234567894",
                    "ExportReason": "",
                    "ExporterAddressLine1": "Exporter Address Line 1",
                    "ExporterAddressLine2": "Exporter Address Line 2",
                    "ExporterAddressLine3": "Exporter Address Line 3",
                    "ExporterCity": "Exporter City",
                    "ExporterCountryCode": "IN",
                    "ExporterCountryName": "India",
                    "ExporterEmail": "exporter@example.com",
                    "ExporterMobilePhoneNumber": "919876543210",
                    "ExporterPersonName": "Exporter Name",
                    "ExporterPhoneNumber": "919876543210",
                    "InvoiceNo": order.order_number.toString(),
                    "IsCargoShipment": false,
                    "IsChequeDD": "",
                    "IsCommercialShipment": false,
                    "IsDedicatedDeliveryNetwork": false,
                    "IsDutyTaxPaidByShipper": false,
                    "IsForcePickup": false,
                    "IsInvoiceRequired": true,
                    "ItemCount": order.line_items.length,
                    "PackType": "1",
                    "PickupDate": `/Date(${new Date(order.created_at).getTime()})/`,
                    "PickupMode": "",
                    "PickupTime": "1400",
                    "PickupType": "",
                    "PieceCount": order.line_items.length.toString(),
                    "ProductCode": "I",
                    "ProductType": 2,
                    "RegisterPickup": true,
                    "itemdtl": internationalItemDetails,
                    "noOfDCGiven": 0
                },
                "Shipper": {
                    "CustomerAddress1": "A2,unit no 1,2,4 Mumbai-Nasik Highway Village",
                    "CustomerAddress2": "Vahuli Post-Padgha",
                    "CustomerAddress3": "GURGAON,HARYANA",
                    "CustomerAddressinfo": "",
                    "CustomerBusinessPartyTypeCode": "",
                    "CustomerCode": "940111",
                    "CustomerEmailID": "TestCustEmail@bd.com",
                    "CustomerFiscalID": "",
                    "CustomerFiscalIDType": "",
                    "CustomerGSTNumber": "HG56GF34DCR543S",
                    "CustomerLatitude": "",
                    "CustomerLongitude": "",
                    "CustomerMaskedContactNumber": "",
                    "CustomerMobile": "9996665554",
                    "CustomerName": "TEST RUN",
                    "CustomerPincode": "122002",
                    "CustomerRegistrationNumber": "",
                    "CustomerRegistrationNumberIssuerCountryCode": "",
                    "CustomerRegistrationNumberTypeCode": "",
                    "CustomerTelephone": "4461606161",
                    "IsToPayCustomer": false,
                    "OriginArea": "GGN",
                    "Sender": "RAJNISH VERMA",
                    "VendorCode": "231335"
                }
            },
            "Profile": {
                "LoginID": "GG940111",
                "LicenceKey": "kh7mnhqkmgegoksipxr0urmqesesseup",
                "Api_type": "S"
            }
        };


        const DomesticData = {
            "Request": {
                "Consignee": {
                    "ConsigneeAddress1": order.billing_address.address1 || order.shipping_address.address1 || "N/A",
                    "ConsigneeAddress2": order.billing_address.address2 || order.shipping_address.address2 || "N/A",
                    "ConsigneeAddress3": order.billing_address.city || order.shipping_address.city || "N/A",
                    "ConsigneeAttention": order.billing_address.company || order.shipping_address.company || "N/A",
                    "ConsigneeEmailID": order.customer.email || "N/A",
                    "ConsigneeMobile": order.billing_address.phone || order.shipping_address.phone || "+919999999999",
                    "ConsigneeName": `${order.billing_address.first_name || order.shipping_address.first_name} ${order.billing_address.last_name || order.shipping_address.last_name}` || "N/A",
                    "ConsigneePincode": order.billing_address.zip || order.shipping_address.zip || "N/A",
                },
                "Returnadds": {
                    "ManifestNumber": "",
                    "ReturnAddress1": order.billing_address.address1 || order.shipping_address.address1 || "",
                    "ReturnAddress2": order.billing_address.address2 || order.shipping_address.address2 || "",
                    "ReturnAddress3": order.billing_address.city || order.shipping_address.city || "",
                    "ReturnAddressinfo": "",
                    "ReturnContact": order.customer.phone || "",
                    "ReturnEmailID": order.customer.email || "",
                    "ReturnMobile": order.customer.phone || "",
                    "ReturnPincode": order.billing_address.zip || order.shipping_address.zip || "",
                    "ReturnTelephone": ""
                },
                "Services": {
                    "AWBNo": "",
                    "ActualWeight": "0.50",
                    "CollectableAmount": 0,
                    "Commodity": {
                        "CommodityDetail1": "5011100014",
                        "CommodityDetail2": "5011100014",
                        "CommodityDetail3": "5011100014"
                    },
                    "CreditReferenceNo": creditReferenceNo,
                    "CreditReferenceNo2": "",
                    "CreditReferenceNo3": "",
                    "CurrencyCode": order.currency,
                    "DeclaredValue": parseFloat(order.current_total_price),
                    "DeliveryTimeSlot": "",
                    "Dimensions": [
                        {
                            "Breadth": 10,
                            "Count": order.line_items.length.toString(),
                            "Height": 10,
                            "Length": 10
                        }
                    ],
                    "FavouringName": "",
                    "ForwardAWBNo": "",
                    "ForwardLogisticCompName": "",
                    "InsurancePaidBy": "",
                    "InvoiceNo": order.order_number.toString(),
                    "IsChequeDD": "",
                    "IsDedicatedDeliveryNetwork": false,
                    "IsForcePickup": false,
                    "IsPartialPickup": false,
                    "IsReversePickup": false,
                    "ItemCount": order.line_items.length,
                    "OTPBasedDelivery": "0",
                    "OTPCode": "",
                    "Officecutofftime": "",
                    "PDFOutputNotRequired": true,
                    // "PackType": "2",
                    "ParcelShopCode": "",
                    "PayableAt": "",
                    "PickupDate": `/Date(${new Date(order.created_at).getTime()})/`,
                    "PickupMode": "",
                    "PickupTime": "0800",
                    "PickupType": "",
                    "PieceCount": order.line_items.length.toString(),
                    "PreferredPickupTimeSlot": "",
                    "ProductCode": "D",
                    "ProductFeature": "",
                    "ProductType": 2,
                    "RegisterPickup": true,
                    "SpecialInstruction": "",
                    "SubProductCode": "",
                    "TotalCashPaytoCustomer": 0,
                    "itemdtl": itemDetails,
                    "noOfDCGiven": 0
                },
                "Shipper": {
                    "CustomerAddress1": "A2,unit no 1,2,4 Mumbai-Nasik Highway Village",
                    "CustomerAddress2": "Vahuli Post-Padgha",
                    "CustomerAddress3": "GURGAON,HARYANA",
                    "CustomerAddressinfo": "",
                    "CustomerCode": "940111",
                    "CustomerEmailID": "",
                    "CustomerGSTNumber": "HBG567FRED567GH",
                    "CustomerLatitude": "",
                    "CustomerLongitude": "",
                    "CustomerMaskedContactNumber": "",
                    "CustomerMobile": "7777777777",
                    "CustomerName": "Pravin Prakash Sangle",
                    "CustomerPincode": "122002",
                    "CustomerTelephone": "7777777777",
                    "IsToPayCustomer": false,
                    "OriginArea": "GGN",
                    "Sender": "BLUE-DART",
                    "VendorCode": "125465"
                }
            },
            "Profile": {
                "LoginID": "GG940111",
                "LicenceKey": "kh7mnhqkmgegoksipxr0urmqesesseup",
                "Api_type": "S"
            }
        };


        const requestData = selected === 'D' ? DomesticData : InternationalData;

        try {
            setLoading(true);
            const res = await fetch('https://apigateway-sandbox.bluedart.com/in/transportation/waybill/v1/GenerateWayBill', {
                method: 'POST',
                headers: {
                    'accept': 'application/json',
                    'JWTToken': jwtToken,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestData)
            });

            const data = await res.json();
            console.log(data);

            if (data["error-response"] && data["error-response"].length > 0) {
                const errorResponse = data["error-response"][0];
                if (errorResponse.IsError) {
                    const errorMessage = errorResponse.Status.map(status => status.StatusInformation).join(', ');
                    setErrorMessage(errorMessage);
                }
            } else {
                setErrorMessage('');

                if (data.GenerateWayBillResult.AWBPrintContent) {
                    // Generate PDF from AWBPrintContent
                    const byteArray = new Uint8Array(data.GenerateWayBillResult.AWBPrintContent);
                    const blob = new Blob([byteArray], { type: 'application/pdf' });
                    const url = URL.createObjectURL(blob);

                    const link = document.createElement('a');
                    link.href = url;
                    link.download = `${data.GenerateWayBillResult.AWBNo}.pdf`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);

                    URL.revokeObjectURL(url);

                    // Set the PDF URL for rendering or further use
                    setPdfUrl(url);
                } else {
                    // Generate barcode as base64 string
                    const AwbNo = data.GenerateWayBillResult.AWBNo;
                    const barcodeBase64 = await generateBarcodeBase64(AwbNo);
                    // Generate PDF using the barcode
                    const blob = await pdf(<MyDocument barcodeBase64={barcodeBase64} domesticData={DomesticData} AWBNo={AwbNo} />).toBlob();

                    // Download the generated PDF
                    saveAs(blob, `${AwbNo}.pdf`);
                }

                setResponse(data);
            }
        } catch (error) {
            console.error('Error fetching waybill:', error);
            setErrorMessage('Failed to generate waybill.');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = () => {
        if (!creditReferenceNo) {
            setErrorMessage('Please enter a credit reference number.');
            return;
        }

        fetchWaybill();
    };

    const handleSelectChange = useCallback((value) => setSelected(value), []);

    const options = [
        {
            label: 'Domestic',
            value: 'D',
            prefix: <Icon source={CaretUpIcon} />,
        },
        {
            label: 'International',
            value: 'I',
            prefix: <Icon source={CaretDownIcon} />,
        },
    ];


    return (
        <Page>
            <Card sectioned>
                <Select
                    label="Product Code"
                    options={options}
                    onChange={handleSelectChange}
                    value={selected}
                />
                <TextField
                    label="Credit Reference Number"
                    value={creditReferenceNo}
                    onChange={setCreditReferenceNo}
                    placeholder="Enter credit reference number"
                />
                <Button onClick={handleSubmit} loading={loading} primary>
                    Generate Waybill
                </Button>
                {errorMessage && <PageText color="red">{errorMessage}</PageText>}
                {loading && <Spinner size="small" />}
            </Card>
        </Page>
    );
}

