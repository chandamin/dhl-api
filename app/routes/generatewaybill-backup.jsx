import React, { useState, useEffect, useCallback } from 'react';
import { Page, Button, Card, TextField, Text as PageText, Spinner, Icon, Select } from '@shopify/polaris';
import { CaretUpIcon, CaretDownIcon } from '@shopify/polaris-icons';
import saveAs from 'file-saver';
import MyDocument from './MyDocument';
import { pdf } from '@react-pdf/renderer';
import { generateBarcodeBase64 } from './util/barcodeUtils';

// Component to generate and download the PDF
export default function GenerateWaybill() {
    const [response, setResponse] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');
    const [barcodeImageUrl, setBarcodeImageUrl] = useState('');
    const [jwtToken, setJwtToken] = useState('');
    const [loading, setLoading] = useState(false);
    const [creditReferenceNo, setCreditReferenceNo] = useState('');
    const clientID = '5jRX1SsJtBujJ2YozVldsGJYd0WgmEQG';
    const clientSecret = 'comCncWQyG5sYERR';
    const [selected, setSelected] = useState('D');

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
    console.log(selected);
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
           "ConsigneeAddress1": "17667 VINTAGE OAK DR",
           "ConsigneeAddress2": "WILD WOOD",
           "ConsigneeAddress3": "ST LOUIS,MO (MISSOURI)",
           "ConsigneeAddressType": "",
           "ConsigneeAddressinfo": "",
           "ConsigneeAttention": "RAJNISH VERMA",
           "ConsigneeBusinessPartyTypeCode": "",
           "ConsigneeCityName": "Dubai",
           "ConsigneeCountryCode": "AE",
           "ConsigneeEmailID": "abc@gmail.com",
           "ConsigneeFiscalID": "",
           "ConsigneeFiscalIDType": "",
           "ConsigneeFullAddress": "",
           "ConsigneeGSTNumber": "",
           "ConsigneeID": "",
           "ConsigneeIDType": "",
           "ConsigneeLatitude": "",
           "ConsigneeLongitude": "",
           "ConsigneeMaskedContactNumber": "",
           "ConsigneeMobile": "9999999441",
           "ConsigneeName": "RAJNISH VERMA",
           "ConsigneePincode": "",
           "ConsigneeStateCode": "",
           "ConsigneeTelephone": "13142014355",
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
               "CommodityDetail1": "Rakhi Wrist Band",
               "CommodityDetail2": "",
               "CommodityDetail3": ""
           },
           "CreditReferenceNo": creditReferenceNo,
           "CreditReferenceNo2": "",
           "CreditReferenceNo3": "",
           "CurrencyCode": "INR",
           "DeclaredValue": 500.0,
           "DeliveryTimeSlot": "",
           "Dimensions": [
               {
                   "Breadth": 10,
                   "Count": 1,
                   "Height": 10,
                   "Length": 10
               }
           ],
           "ECCN": "",
           "EsellerPlatformName": "",
           "ExchangeWaybillNo": "",
           "ExportImportCode": "1234567894",
           "ExportReason": "",
           "ExporterAddressLine1": "",
           "ExporterAddressLine2": "",
           "ExporterAddressLine3": "",
           "ExporterBusinessPartyTypeCode": "",
           "ExporterCity": "",
           "ExporterCompanyName": "",
           "ExporterCountryCode": "",
           "ExporterCountryName": "",
           "ExporterDivision": "",
           "ExporterDivisionCode": "",
           "ExporterEmail": "",
           "ExporterFaxNumber": "",
           "ExporterMobilePhoneNumber": "",
           "ExporterPersonName": "",
           "ExporterPhoneNumber": "",
           "ExporterPostalCode": "",
           "ExporterRegistrationNumber": "",
           "ExporterRegistrationNumberIssuerCountryCode": "",
           "ExporterRegistrationNumberTypeCode": "",
           "ExporterSuiteDepartmentName": "",
           "FavouringName": "",
           "ForwardAWBNo": "",
           "ForwardLogisticCompName": "",
           "FreightCharge": 0.0,
           "GovNongovType": "",
           "IncotermCode": "DAP",
           "InsuranceAmount": 0.0,
           "InsurancePaidBy": "",
           "InsurenceCharge": 0.0,
           "InvoiceNo": "",
           "IsCargoShipment": false,
           "IsChequeDD": "",
           "IsCommercialShipment": false,
           "IsDedicatedDeliveryNetwork": false,
           "IsDutyTaxPaidByShipper": false,
           "IsEcomUser": 1,
           "IsForcePickup": false,
           "IsIntlEcomCSBUser": 0,
           "IsInvoiceRequired": true,
           "IsPartialPickup": false,
           "IsReversePickup": false,
           "ItemCount": 1,
           "MarketplaceName": "",
           "MarketplaceURL": "",
           "NFEIFlag": false,
           "NotificationMessage": "",
           "Officecutofftime": "",
           "OrderURL": "",
           "PDFOutputNotRequired": false,
           "PackType": "1",
           "ParcelShopCode": "",
           "PayableAt": "",
           "PayerGSTVAT": 0.0,
           "PickupDate": "/Date(1703246810000)/",
           "PickupMode": "",
           "PickupTime": "1400",
           "PickupType": "",
           "PieceCount": "1",
           "PrinterLableSize": "4",
           "PreferredPickupTimeSlot": "",
           "ProductCode": "I",
           "ProductFeature": "",
           "ProductType": 2,
           "RegisterPickup": false,
           "ReverseCharge": 0.0,
           "SignatureName": "",
           "SignatureTitle": "",
           "SpecialInstruction": "",
           "SubProductCode": "",
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
                   "Instruction": "",
                   "InvoiceDate":"/Date(1703246810000)/",
                   "InvoiceNumber": "1212121",
                   "IsMEISS": "0",
                   "ItemID": "13232",
                   "ItemName": "Rakhi",
                   "ItemValue": 500.0,
                   "Itemquantity": 1,
                   "LicenseNumber": "",
                   "ManufactureCountryCode": "IN",
                   "ManufactureCountryName": "INDIA",
                   "PerUnitRate": 500.0,
                   "PieceID": "1",
                   "PieceIGSTPercentage": 0.0,
                   "PlaceofSupply": "",
                   "ProductDesc1": "Others",
                   "ProductDesc2": "",
                   "ReturnReason": "",
                   "SGSTAmount": 0.0,
                   "SKUNumber": "SKU1771",
                   "SellerGSTNNumber": "",
                   "SellerName": "",
                   "TaxableAmount": 500.0,
                   "TotalValue": 500.0,
                   "Unit": "PCS",
                   "Weight": 0.50,
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
           "CustomerAddressinfo": "",
           "CustomerBusinessPartyTypeCode": "",
           "CustomerCode": "940111",
           "CustomerEmailID": "TestCustEmail@bd.com",
           "CustomerFiscalID": "",
           "CustomerFiscalIDType": "",
           "CustomerGSTNumber": "87GHFR45DCGT67H",
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
                    "AvailableDays": "",
                    "AvailableTiming": "",
                    "ConsigneeAddress1": "2B,Uparika Malika",
                    "ConsigneeAddress2": "Pandit Karuppan Road",
                    "ConsigneeAddress3": "Cochin",
                    "ConsigneeAddressType": "",
                    "ConsigneeAddressinfo": "",
                    "ConsigneeAttention": "Anoushka Dominic",
                    "ConsigneeEmailID": "Anoushka@gmail.com",
                    "ConsigneeFullAddress": "",
                    "ConsigneeGSTNumber": "",
                    "ConsigneeLatitude": "",
                    "ConsigneeLongitude": "",
                    "ConsigneeMaskedContactNumber": "",
                    "ConsigneeMobile": "9995554441",
                    "ConsigneeName": "Anoushka Dominic",
                    "ConsigneePincode": "682013",
                    "ConsigneeTelephone": ""
                },
                "Returnadds": {
                    "ManifestNumber": "",
                    "ReturnAddress1": "Plot no 1234 Bamnauli",
                    "ReturnAddress2": "Test RTO Addr2",
                    "ReturnAddress3": "Test RTO Addr3",
                    "ReturnAddressinfo": "",
                    "ReturnContact": "ABCD",
                    "ReturnEmailID": "testemail@bluedart.com",
                    "ReturnLatitude": "",
                    "ReturnLongitude": "",
                    "ReturnMaskedContactNumber": "",
                    "ReturnMobile": "9995554337",
                    "ReturnPincode": "100077",
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
                    "CurrencyCode": "",
                    "DeclaredValue": 1000,
                    "DeliveryTimeSlot": "",
                    "Dimensions": [
                        {
                            "Breadth": 10,
                            "Count": 1,
                            "Height": 10,
                            "Length": 10
                        }
                    ],
                    "FavouringName": "",
                    "ForwardAWBNo": "",
                    "ForwardLogisticCompName": "",
                    "InsurancePaidBy": "",
                    "InvoiceNo": "",
                    "IsChequeDD": "",
                    "IsDedicatedDeliveryNetwork": false,
                    "IsForcePickup": false,
                    "IsPartialPickup": false,
                    "IsReversePickup": false,
                    "ItemCount": 1,
                    "OTPBasedDelivery": "0",
                    "OTPCode": "",
                    "Officecutofftime": "",
                    "PDFOutputNotRequired": true,
                    "PackType": "1",
                    "ParcelShopCode": "",
                    "PayableAt": "",
                    "PickupDate": "/Date(1683376344000)/",
                    "PickupMode": "",
                    "PickupTime": "0800",
                    "PickupType": "",
                    "PieceCount": "1",
                    "PreferredPickupTimeSlot": "",
                    "ProductCode": "D",
                    "ProductFeature": "",
                    "ProductType": 2,
                    "RegisterPickup": true,
                    "SpecialInstruction": "",
                    "SubProductCode": "",
                    "TotalCashPaytoCustomer": 0,
                    "itemdtl": [
                        {
                            "CGSTAmount": 0,
                            "HSCode": "",
                            "IGSTAmount": 0,
                            "IGSTRate": 0,
                            "Instruction": "",
                            "InvoiceDate": "/Date(1683270818000)/",
                            "InvoiceNumber": "121212",
                            "ItemID": "Test Item ID1",
                            "ItemName": "Test Item1",
                            "ItemValue": 35672,
                            "Itemquantity": 1,
                            "PlaceofSupply": "Gurgaon",
                            "ProductDesc1": "Test Item1",
                            "ProductDesc2": "Test Item1",
                            "ReturnReason": "",
                            "SGSTAmount": 0,
                            "SKUNumber": "SKU1771",
                            "SellerGSTNNumber": "Z2222222",
                            "SellerName": "ABC ENTP",
                            "TaxableAmount": 0,
                            "TotalValue": 35672,
                            "cessAmount": "0.0",
                            "countryOfOrigin": "IN",
                            "docType": "INV",
                            "subSupplyType": 1,
                            "supplyType": "0"
                        }
                    ],
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
        }

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
                    const barcodeBase64 = await generateBarcodeBase64(creditReferenceNo);
                    const AwbNo = data.GenerateWayBillResult.AWBNo;
                    // Generate PDF using the barcode
                    const blob = await pdf(<MyDocument barcodeBase64={barcodeBase64} domesticData={DomesticData} AWBNo={AwbNo}/>).toBlob();

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

