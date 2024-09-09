import React, { useState, useEffect, useCallback } from 'react';
import { useLoaderData } from '@remix-run/react';
import { pdf } from '@react-pdf/renderer';
import saveAs from 'file-saver';
import MyDocument from './MyDocument'; // Ensure this is implemented to generate PDF
import { generateBarcodeBase64 } from './util/barcodeUtils'; 
import { loader as orderLoader } from "./loaders/getorderbyId";

export { orderLoader as loader };

export default function GenerateWaybill() {
  const [loading, setLoading] = useState(false);
  const [creditReferenceNo, setCreditReferenceNo] = useState('');
  const [pdfBlob, setPdfBlob] = useState(null);

  const order = useLoaderData();

  const shipperData = {
    "Shipper": {
      "CustomerAddress1": "A2,unit no 1,2,4 Mumbai-Nasik Highway Village",
      "CustomerAddress2": "Vahuli Post-Padgha",
      "CustomerAddress3": "GURGAON,HARYANA",
      "CustomerCode": "940111",
      "CustomerGSTNumber": "HBG567FRED567GH",
      "CustomerMobile": "7777777777",
      "CustomerName": "Pravin Prakash Sangle",
      "CustomerPincode": "122002",
      "CustomerTelephone": "7777777777",
      "OriginArea": "GGN",
      "Sender": "BLUE-DART",
      "VendorCode": "125465"
    }
  };

  const profileData = {
    "Profile": {
      "LoginID": "GG940111",
      "LicenceKey": "kh7mnhqkmgegoksipxr0urmqesesseup",
      "Api_type": "S"
    }
  };

  const generateRandomCreditReferenceNo = () => {
    return Math.floor(Math.random() * (1000000000 - 1000 + 1)) + 1000;
  };

  const fetchWaybill = async () => {
    const consigneeData = {
      "Consignee": {
        "ConsigneeAddress1": order.shipping_address.address1,
        "ConsigneeAddress2": order.shipping_address.address2 || "",
        "ConsigneeAddress3": order.shipping_address.city || "",
        "ConsigneeAttention": `${order.shipping_address.first_name} ${order.shipping_address.last_name}`,
        "ConsigneeEmailID": order.email || "",
        "ConsigneeMobile": order.phone || "",
        "ConsigneeName": `${order.shipping_address.first_name} ${order.shipping_address.last_name}`,
        "ConsigneePincode": order.shipping_address.zip || ""
      },
      "Returnadds": {
        "ReturnAddress1": "Plot no 1234 Bamnauli",
        "ReturnAddress2": "Test RTO Addr2",
        "ReturnAddress3": "Test RTO Addr3",
        "ReturnContact": "ABCD",
        "ReturnEmailID": "testemail@bluedart.com",
        "ReturnMobile": "9995554337",
        "ReturnPincode": "100077"
      },
      "Services": {
        "ActualWeight": "0.50",
        "CollectableAmount": 0,
        "Commodity": {
          "CommodityDetail1": "5011100014",
          "CommodityDetail2": "5011100014",
          "CommodityDetail3": "5011100014"
        },
        "CreditReferenceNo": creditReferenceNo,
        "CurrencyCode": order.currency,
        "DeclaredValue": order.total_price,
        "Dimensions": [
          {
            "Breadth": 10,
            "Count": 1,
            "Height": 10,
            "Length": 10
          }
        ],
        "OTPBasedDelivery": "0",
        "PDFOutputNotRequired": true,
        "PackType": "1",
        "PickupDate": new Date().toISOString(),
        "PickupTime": "0800",
        "PieceCount": `${order.line_items.length}`,
        "ProductCode": selected,
        "ProductType": 2,
        "RegisterPickup": true,
        "itemdtl": order.line_items.map(item => ({
          "HSCode": "",
          "InvoiceDate": new Date().toISOString(),
          "InvoiceNumber": order.name,
          "ItemID": item.sku,
          "ItemName": item.title,
          "ItemValue": item.price,
          "Itemquantity": item.quantity,
          "PlaceofSupply": order.shipping_address.city,
          "ProductDesc1": item.title,
          "ProductDesc2": item.title,
          "SGSTAmount": 0,
          "SKUNumber": item.sku,
          "SellerGSTNNumber": "Z2222222",
          "SellerName": "ABC ENTP",
          "TaxableAmount": item.price,
          "TotalValue": item.price,
          "cessAmount": "0.0",
          "countryOfOrigin": "IN",
          "docType": "INV",
          "subSupplyType": 1,
          "supplyType": "0"
        })),
        "noOfDCGiven": 0
      }
    };

    try {
      setLoading(true);
      const res = await fetch('https://apigateway-sandbox.bluedart.com/in/transportation/waybill/v1/GenerateWayBill', {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ...consigneeData, ...shipperData, ...profileData })
      });

      const data = await res.json();

      if (data["error-response"] && data["error-response"].length > 0) {
        const errorResponse = data["error-response"][0];
        if (errorResponse.IsError) {
          throw new Error(errorResponse.Status.map(status => status.StatusInformation).join(', '));
        }
      } else {
        if (data.GenerateWayBillResult.AWBPrintContent) {
          // Generate PDF from AWBPrintContent
          const byteArray = new Uint8Array(data.GenerateWayBillResult.AWBPrintContent);
          const blob = new Blob([byteArray], { type: 'application/pdf' });
          setPdfBlob(blob);
        } else {
          // Generate barcode as base64 string
          const barcodeBase64 = await generateBarcodeBase64(creditReferenceNo);
          const AwbNo = data.GenerateWayBillResult.AWBNo;
          // Generate PDF using the barcode
          const blob = await pdf(<MyDocument barcodeBase64={barcodeBase64} domesticData={DomesticData} AWBNo={AwbNo} />).toBlob();
          setPdfBlob(blob);
        }
      }
    } catch (error) {
      console.error('Error fetching waybill:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setCreditReferenceNo(generateRandomCreditReferenceNo());
  }, []);

  useEffect(() => {
    if (creditReferenceNo) {
      fetchWaybill();
    }
  }, [creditReferenceNo]);

  useEffect(() => {
    if (pdfBlob) {
      saveAs(pdfBlob, 'waybill.pdf');
    }
  }, [pdfBlob]);

  return null; // Return nothing as we only handle PDF download
}
