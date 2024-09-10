import React, { useState, useEffect } from 'react';
import { Page, Button, Spinner, Text } from '@shopify/polaris';
import { pdf } from '@react-pdf/renderer';
import { generateBarcodeBase64 } from './util/barcodeUtils';
import MyDocument from './MyDocument';
import saveAs from 'file-saver';

// Helper function to generate a random alphanumeric string
const generateRandomString = (length) => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        result += characters[randomIndex];
    }
    return result;
};

export default function GenerateWaybill({ order, onClose }) {
    const [response, setResponse] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [pdfUrl, setPdfUrl] = useState(null);
    const [jwtToken, setJwtToken] = useState('');
    const clientID = '5jRX1SsJtBujJ2YozVldsGJYd0WgmEQG';
    const clientSecret = 'comCncWQyG5sYERR';

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

        if (!order) {
            setErrorMessage('Order data is not available.');
            return;
        }

        const itemDetails = order.line_items.map((item, index) => ({
            HSCode: "",
            IGSTAmount: 0,
            IGSTRate: 0,
            Instruction: "",
            InvoiceDate: `/Date(${new Date(order.created_at).getTime()})/`,
            InvoiceNumber: order.order_number.toString(),
            ItemID: index.toString(),
            ItemName: item.name || "N/A",
            ItemValue: parseFloat(item.price),
            Itemquantity: item.quantity,
            PlaceofSupply: order.billing_address.city || order.billing_address.city,
            ProductDesc1: item.title,
            ProductDesc2: item.variant_title,
            ReturnReason: "",
            SGSTAmount: 0,
            SKUNumber: item.sku || "",
            SellerGSTNNumber: "",
            SellerName: "",
            TaxableAmount: parseFloat(item.price),
            TotalValue: parseFloat(item.price) * item.quantity,
            CGSTAmount: 0,
            cessAmount: "0.0",
            countryOfOrigin: "IN",
            docType: "INV",
            subSupplyType: 1,
            supplyType: "0"
        }));

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

        const DomesticData = {
            "Request": {
                "Consignee": {
                    "ConsigneeAddress1": order.shipping_address.address1 || "N/A",
                    "ConsigneeAddress2": order.shipping_address.address2 || "N/A",
                    "ConsigneeAddress3": order.shipping_address.city || "N/A",
                    "ConsigneeAttention": order.shipping_address.company || "N/A",
                    "ConsigneeEmailID": order.customer.email || "N/A",
                    "ConsigneeMobile": order.shipping_address.phone || "+919999999999",
                    "ConsigneeName": `${order.shipping_address.first_name} ${order.shipping_address.last_name}` || "N/A",
                    "ConsigneePincode": order.shipping_address.zip || "N/A",
                },
                "Returnadds": {
                    "ManifestNumber": "",
                    "ReturnAddress1": order.shipping_address.address1 || "",
                    "ReturnAddress2": order.shipping_address.address2 || "",
                    "ReturnAddress3": order.shipping_address.city || "",
                    "ReturnAddressinfo": "",
                    "ReturnContact": order.customer.phone || "",
                    "ReturnEmailID": order.customer.email || "",
                    "ReturnMobile": order.customer.phone || "",
                    "ReturnPincode": order.shipping_address.zip || "",
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
                    "CreditReferenceNo": generateRandomString(10),
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
        
        const InternationalData = {
            "Request": {
                "Consignee": {
                    "AvailableDays": "",  // Add default value if known
                    "AvailableTiming": "",  // Add default value if known
                    "ConsigneeAddress1": order.billing_address.address1 || order.shipping_address.address1 || "17667 VINTAGE OAK DR",
                    "ConsigneeAddress2": order.billing_address.address2 || order.shipping_address.address2 || "WILD WOOD",
                    "ConsigneeAddress3": order.billing_address.city || order.shipping_address.city || "ST LOUIS,MO (MISSOURI)",
                    "ConsigneeAddressType": "",  // Add default value if known
                    "ConsigneeAddressinfo": "",  // Add default value if known
                    "ConsigneeAttention": `${order.shipping_address.first_name} ${order.shipping_address.last_name}` || "RAJNISH VERMA",
                    "ConsigneeBusinessPartyTypeCode": "",  // Add default value if known
                    "ConsigneeCityName": order.billing_address.city || order.shipping_address.city || "Dubai",
                    "ConsigneeCountryCode": order.shipping_address.country_code || "AE",
                    "ConsigneeEmailID": order.customer.email || "abc@gmail.com",
                    "ConsigneeFiscalID": "",  // Add default value if known
                    "ConsigneeFiscalIDType": "",  // Add default value if known
                    "ConsigneeFullAddress": "",  // Add default value if known
                    "ConsigneeGSTNumber": "",  // Add default value if known
                    "ConsigneeID": order.customer.id || "",  // Ensure ID is provided or set default
                    "ConsigneeIDType": "",  // Add default value if known
                    "ConsigneeLatitude": "",  // Add default value if known
                    "ConsigneeLongitude": "",  // Add default value if known
                    "ConsigneeMaskedContactNumber": "",  // Add default value if known
                    "ConsigneeMobile": order.shipping_address.phone || "9999999441",
                    "ConsigneeName": `${order.shipping_address.first_name} ${order.shipping_address.last_name}` || "RAJNISH VERMA",
                    "ConsigneePincode": order.shipping_address.zip || "",
                    "ConsigneeStateCode": order.shipping_address.province_code || "",
                    "ConsigneeTelephone": order.shipping_address.phone || "13142014355",
                    "ConsingeeFederalTaxId": "",  // Add default value if known
                    "ConsingeeRegistrationNumber": "",  // Add default value if known
                    "ConsingeeRegistrationNumberIssuerCountryCode": "",  // Add default value if known
                    "ConsingeeRegistrationNumberTypeCode": "",  // Add default value if known
                    "ConsingeeStateTaxId": ""  // Add default value if known
                },
                "Services": {
                    "AWBNo": "",  // Add default value if known
                    "ActualWeight": "0.50",
                    "AdditionalDeclaration": "",  // Add default value if known
                    "AuthorizedDealerCode": "6390948XXXXXXX",
                    "BankAccountNumber": "",  // Add default value if known
                    "BillToAddressLine1": "",  // Add default value if known
                    "BillToCity": "",  // Add default value if known
                    "BillToCompanyName": "",  // Add default value if known
                    "BillToContactName": "",  // Add default value if known
                    "BillToCountryCode": "",  // Add default value if known
                    "BillToCountryName": "",  // Add default value if known
                    "BillToFederalTaxID": "",  // Add default value if known
                    "BillToPhoneNumber": "",  // Add default value if known
                    "BillToPostcode": "",  // Add default value if known
                    "BillToState": "",  // Add default value if known
                    "BillToSuburb": "",  // Add default value if known
                    "BillingReference1": "",  // Add default value if known
                    "BillingReference2": "",  // Add default value if known
                    "CessCharge": 0.0,
                    "CollectableAmount": 0.0,
                    "Commodity": {
                        "CommodityDetail1": "Rakhi Wrist Band",
                        "CommodityDetail2": "",  // Add default value if known
                        "CommodityDetail3": ""  // Add default value if known
                    },
                    "CreditReferenceNo": generateRandomString(10),
                    "CreditReferenceNo2": "",  // Add default value if known
                    "CreditReferenceNo3": "",  // Add default value if known
                    "CurrencyCode": order.currency || "INR",
                    "DeclaredValue": parseFloat(order.current_total_price) || 500.0,
                    "DeliveryTimeSlot": "",  // Add default value if known
                    "Dimensions": [
                        {
                            "Breadth": 10,
                            "Count": order.line_items.length.toString() || 1,
                            "Height": 10,
                            "Length": 10
                        }
                    ],
                    "ECCN": "",  // Add default value if known
                    "EsellerPlatformName": "",  // Add default value if known
                    "ExchangeWaybillNo": "",  // Add default value if known
                    "ExportImportCode": "1234567894",
                    "ExportReason": "",  // Add default value if known
                    "ExporterAddressLine1": "",  // Add default value if known
                    "ExporterAddressLine2": "",  // Add default value if known
                    "ExporterAddressLine3": "",  // Add default value if known
                    "ExporterBusinessPartyTypeCode": "",  // Add default value if known
                    "ExporterCity": "",  // Add default value if known
                    "ExporterCompanyName": "",  // Add default value if known
                    "ExporterCountryCode": "",  // Add default value if known
                    "ExporterCountryName": "",  // Add default value if known
                    "ExporterDivision": "",  // Add default value if known
                    "ExporterDivisionCode": "",  // Add default value if known
                    "ExporterEmail": "",  // Add default value if known
                    "ExporterFaxNumber": "",  // Add default value if known
                    "ExporterMobilePhoneNumber": "",  // Add default value if known
                    "ExporterPersonName": "",  // Add default value if known
                    "ExporterPhoneNumber": "",  // Add default value if known
                    "ExporterPostalCode": "",  // Add default value if known
                    "ExporterRegistrationNumber": "",  // Add default value if known
                    "ExporterRegistrationNumberIssuerCountryCode": "",  // Add default value if known
                    "ExporterRegistrationNumberTypeCode": "",  // Add default value if known
                    "ExporterSuiteDepartmentName": "",  // Add default value if known
                    "FavouringName": "",  // Add default value if known
                    "ForwardAWBNo": "",  // Add default value if known
                    "ForwardLogisticCompName": "",  // Add default value if known
                    "FreightCharge": 0.0,
                    "GovNongovType": "",  // Add default value if known
                    "IncotermCode": "DAP",
                    "InsuranceAmount": 0.0,
                    "InsurancePaidBy": "",  // Add default value if known
                    "InsurenceCharge": 0.0,
                    "InvoiceNo": order.order_number.toString() || "",  // Ensure InvoiceNo is provided or set default
                    "IsCargoShipment": false,
                    "IsChequeDD": "",  // Add default value if known
                    "IsCommercialShipment": false,
                    "IsDedicatedDeliveryNetwork": false,
                    "IsDutyTaxPaidByShipper": false,
                    "IsEcomUser": 1,
                    "IsForcePickup": false,
                    "IsIntlEcomCSBUser": 0,
                    "IsInvoiceRequired": true,
                    "IsPartialPickup": false,
                    "IsReversePickup": false,
                    "ItemCount": order.line_items.length || 1,
                    "MarketplaceName": "",  // Add default value if known
                    "MarketplaceURL": "",  // Add default value if known
                    "NFEIFlag": false,
                    "NotificationMessage": "",  // Add default value if known
                    "Officecutofftime": "",  // Add default value if known
                    "OrderURL": "",  // Add default value if known
                    "PDFOutputNotRequired": false,
                    "PackType": "1",
                    "ParcelShopCode": "",  // Add default value if known
                    "PayableAt": "",  // Add default value if known
                    "PayerGSTVAT": 0.0,
                    "PickupDate": `/Date(${new Date(order.created_at).getTime()})/`,
                    "PickupMode": "",  // Add default value if known
                    "PickupTime": "1400",
                    "PickupType": "",  // Add default value if known
                    "PieceCount": internationalItemDetails.length.toString() || "0",
                    "PrinterLableSize": "4",
                    "PreferredPickupTimeSlot": "",  // Add default value if known
                    "ProductCode": "I",
                    "ProductFeature": "",  // Add default value if known
                    "ProductType": 2,
                    "RegisterPickup": false,
                    "ReverseCharge": 0.0,
                    "SignatureName": "",  // Add default value if known
                    "SignatureTitle": "",  // Add default value if known
                    "SpecialInstruction": "",  // Add default value if known
                    "SubProductCode": "",  // Add default value if known
                    "SupplyOfIGST": "No",
                    "SupplyOfwoIGST": "Yes",
                    "TermsOfTrade": "DAP",
                    "TotalCashPaytoCustomer": 0.0,
                    "Total_IGST_Paid": 0.0,
                    "itemdtl": [
                        {
                            "CGSTAmount": 0.0,
                            "CommodityCode": "FOODSTUFF",
                            "Discount": 0.0,
                            "HSCode": "95059090",
                            "IGSTAmount": 0.0,
                            "IGSTRate": 0.0,
                            "Instruction": "",  // Add default value if known
                            "InvoiceDate": `/Date(${new Date(order.created_at).getTime()})/`,
                            "InvoiceNumber": order.order_number.toString() || "1212121",  // Ensure InvoiceNumber is provided or set default
                            "IsMEISS": "0",
                            "ItemID": "13232",
                            "ItemName": "Rakhi",
                            "ItemValue": parseFloat(order.current_total_price) || 500.0,
                            "Itemquantity": order.line_items.length || 1,
                            "LicenseNumber": "",  // Add default value if known
                            "ManufactureCountryCode": "IN",
                            "ManufactureCountryName": "INDIA",
                            "PerUnitRate": parseFloat(order.current_total_price) / (order.line_items.length || 1) || 500.0,
                            "PieceID": "1",
                            "PieceIGSTPercentage": 0.0,
                            "PlaceofSupply": "",  // Add default value if known
                            "ProductDesc1": "Others",
                            "ProductDesc2": "",  // Add default value if known
                            "ReturnReason": "",  // Add default value if known
                            "SGSTAmount": 0.0,
                            "SKUNumber": "SKU1771",
                            "SellerGSTNNumber": "",  // Add default value if known
                            "SellerName": "",  // Add default value if known
                            "TaxableAmount": parseFloat(order.current_total_price) || 500.0,
                            "TotalValue": parseFloat(order.current_total_price) || 500.0,
                            "Unit": "PCS",
                            "Weight": "0.50",
                            "cessAmount": "0.0",
                            "countryOfOrigin": "IN"
                        }
                    ],
                    "noOfDCGiven": 0
                },
                "Shipper": {
                    "CustomerAddress1": "Test Cust Addr1",
                    "CustomerAddress2": "Test Cust Addr2",
                    "CustomerAddress3": "Test Cust Addr3",
                    "CustomerAddressinfo": "",  // Add default value if known
                    "CustomerBusinessPartyTypeCode": "",  // Add default value if known
                    "CustomerCode": "940111",
                    "CustomerEmailID": "TestCustEmail@bd.com",
                    "CustomerFiscalID": "",  // Add default value if known
                    "CustomerFiscalIDType": "",  // Add default value if known
                    "CustomerGSTNumber": "HG56GF34DCR543S",
                    "CustomerLatitude": "",  // Add default value if known
                    "CustomerLongitude": "",  // Add default value if known
                    "CustomerMaskedContactNumber": "",  // Add default value if known
                    "CustomerMobile": "9996665554",
                    "CustomerName": "TEST RUN",
                    "CustomerPincode": "122002",
                    "CustomerRegistrationNumber": "",  // Add default value if known
                    "CustomerRegistrationNumberIssuerCountryCode": "",  // Add default value if known
                    "CustomerRegistrationNumberTypeCode": "",  // Add default value if known
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


        let RequestData = "";
        if (order.shipping_address.country_code !== 'IN') {
            RequestData = InternationalData;
        } else {
            RequestData = DomesticData;
        }
        try {
            setLoading(true);
            const res = await fetch('https://apigateway-sandbox.bluedart.com/in/transportation/waybill/v1/GenerateWayBill', {
                method: 'POST',
                headers: {
                    'accept': 'application/json',
                    'JWTToken': jwtToken,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(RequestData)
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
                    saveAs(blob, `${data.GenerateWayBillResult.AWBNo}.pdf`);
                } else {
                    // Generate barcode as base64 string
                    const AwbNo = data.GenerateWayBillResult.AWBNo;
                    const barcodeBase64 = await generateBarcodeBase64(AwbNo);

                    // Generate PDF using the barcode
                    const blob = await pdf(
                        <MyDocument
                            barcodeBase64={barcodeBase64}
                            domesticData={DomesticData}
                            AWBNo={AwbNo}
                        />
                    ).toBlob();

                    // Automatically download the generated PDF
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

    useEffect(() => {
        if (order) {
            fetchWaybill();
        }
    }, [order]);

    return (
        <Page>
            {loading && <Spinner size="large" />}
            {errorMessage && <Text color="red">{errorMessage}</Text>}
            {pdfUrl && (
                <iframe
                    src={pdfUrl}
                    style={{ width: '100%', height: '600px' }}
                    title="PDF Preview"
                />
            )}
            <Button onClick={fetchWaybill}>Generate PDF</Button>
            <Button onClick={onClose}>Close</Button>
        </Page>
    );
}
