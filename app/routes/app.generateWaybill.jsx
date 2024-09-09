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
            // Populate item details as needed
            ItemID: index.toString(),
            ItemName: item.name || "N/A",
            ItemValue: parseFloat(item.price),
            Itemquantity: item.quantity,
            // Other fields...
        }));

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

        try {
            setLoading(true);
            const res = await fetch('https://apigateway-sandbox.bluedart.com/in/transportation/waybill/v1/GenerateWayBill', {
                method: 'POST',
                headers: {
                    'accept': 'application/json',
                    'JWTToken': jwtToken,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(DomesticData)
            });

            const data = await res.json();

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
