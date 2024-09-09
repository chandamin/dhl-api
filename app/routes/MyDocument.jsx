import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

const MyDocument = ({ barcodeBase64, domesticData, AWBNo }) => {
  const Consignee = domesticData.Request.Consignee;
  const Services = domesticData.Request.Services;
  const Shipper = domesticData.Request.Shipper;

  const { itemdtl = [] } = Services;
  const formatDate = (timestamp) => {
    // Convert the timestamp from milliseconds to a Date object
    const date = new Date(parseInt(timestamp.match(/\d+/)[0]));

    // Format the date as needed (example: YYYY-MM-DD)
    const formattedDate = date.toISOString().split('T')[0]; // This will return "YYYY-MM-DD"

    return formattedDate;
  };

  return (
    <Document>
      <Page style={styles.body}>
        <View style={styles.contentWrapper}>
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Image src="/app/img/logo.png" style={styles.logo} />
            </View>
            <View style={styles.contentContainer}>
              <Text style={styles.orderInfo}>Order No. #{Services.InvoiceNo || 'N/A'}</Text>
              <Text style={styles.orderInfo}>Order Date - {Services.PickupDate ? formatDate(Services.PickupDate) : 'N/A'}</Text>
              <Text style={styles.orderInfo}>Sender's Address - {Shipper.CustomerAddress1 || 'N/A'},{Shipper.CustomerAddress2 || 'N/A'} - {Shipper.CustomerPincode || 'N/A'}</Text>
              <Text style={styles.orderInfo}>Shipped By - {Shipper.Sender || 'N/A'}</Text>
              <Text style={styles.orderInfo}>GSTIN - {Shipper.CustomerGSTNumber || 'N/A'}</Text>
              {/* <Text style={styles.prepaid}>Prepaid</Text> */}
              <Text style={styles.prepaid}>
                {Services.SubProductCode === 'P' ? 'Prepaid' :
                  Services.SubProductCode === 'D' ? 'Demand Draft on Delivery' :
                    Services.SubProductCode === 'C' ? 'Cash on Delivery' :
                      Services.SubProductCode === 'A' ? 'Freight on Delivery' :
                        Services.SubProductCode === 'B' ? 'Demand Draft on Delivery & Freight on Delivery' :
                          ''}
              </Text>
            </View>
          </View>

          <View style={styles.barcodeContainer}>
            <Text style={styles.barcodeText}>{Shipper.OriginArea}</Text>
            <View style={styles.barcodeImage}>
              <Image src={barcodeBase64} style={styles.barcodeImage} />
              <Text style={styles.barcodeText}>*{AWBNo}*</Text>
            </View>
          </View>

          <View style={styles.addressContainer}>
            <View style={styles.address}>
              <Text style={styles.delivery}>Delivery Address</Text>
              <Text style={styles.deliveryContent}>{Consignee.ConsigneeAttention || 'N/A'}</Text>
              <Text style={styles.deliveryContent}>{Consignee.ConsigneeAddress2 || 'N/A'} , {Consignee.ConsigneeAddress1 || 'N/A'}</Text>
              <Text style={styles.deliveryContent}>{Consignee.ConsigneeAddress3 || 'N/A'} - {Consignee.ConsigneePincode}</Text>
              {/* <Text style={styles.deliveryContent}></Text> */}
              {/* <Text style={styles.deliveryContent}>{Consignee.ConsigneeCityName || 'N/A'}</Text>
              <Text style={styles.deliveryContent}>{Consignee.ConsigneeCountryCode || 'N/A'}</Text> */}
              <Text style={styles.deliveryContent}>Phone - {Consignee.ConsigneeMobile || 'N/A'}</Text>
            </View>
            <Text style={styles.prepaidRight}>
              {Services.SubProductCode === 'P' ? 'Prepaid' :
                Services.SubProductCode === 'D' ? 'Demand Draft on Delivery' :
                  Services.SubProductCode === 'C' ? 'Cash on Delivery' :
                    Services.SubProductCode === 'A' ? 'Freight on Delivery' :
                      Services.SubProductCode === 'B' ? 'Demand Draft on Delivery & Freight on Delivery' :
                        ''}
            </Text>

          </View>

          <View style={styles.tableContainer}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderText, styles.noborder, styles.tableHeaderTextSerial]}>S.no</Text>
              <Text style={[styles.tableHeaderText, styles.tableHeaderTextDescription]}>Item Description</Text>
              <Text style={[styles.tableHeaderText, styles.tableHeaderTextSku]}>SKU</Text>
              <Text style={[styles.tableHeaderText, styles.tableHeaderTextQty]}>Qty</Text>
            </View>
            {itemdtl.map((item, index) => (
              <View style={styles.tableRow} key={item.ItemID || index}>
                <Text style={[styles.tableCell, styles.noborder, styles.tableCellSerial]}>{index + 1}</Text>
                <Text style={[styles.tableCell, styles.tableCellDescription]}>{item.ItemName || 'N/A'}</Text>
                <Text style={[styles.tableCell, styles.tableCellSku]}>{item.SKUNumber || 'N/A'}</Text>
                <Text style={[styles.tableCell, styles.tableCellQty]}>{item.Itemquantity || 'N/A'}</Text>
              </View>
            ))}
            <Text style={styles.dimensions}>
              Dimensions: {Services.Dimensions?.[0]?.Length || 'N/A'} x {Services.Dimensions?.[0]?.Breadth || 'N/A'} x {Services.Dimensions?.[0]?.Height || 'N/A'}, Total Weight: {Services.ActualWeight || 'N/A'} KG
            </Text>
          </View>


          <View style={styles.footer}>
            <Text style={styles.fo_text}>If undelivered, please return to:</Text>
            <Text style={styles.fo_text}>Plot no 1234 Bamnauli, Test RTO Addr2, Test RTO Addr3</Text>
            <Text style={styles.fo_text}>Phone - 9995554337</Text>
            <Text style={styles.disclaimer}>
              Disclaimer: Blue Dart is not responsible for any kind of cost difference or poor quality.
            </Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};

// Define styles for the PDF content
const styles = StyleSheet.create({
  body: {
    padding: 30,
    margin: 0,
    fontFamily: 'Helvetica',
    position: 'relative',
  },
  contentWrapper: {
    margin: 10,
    height: '60%',
    width: '70%',
    border: '2px solid black',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: 'black',
    height: '20%'
  },
  logoContainer: {
    width: '40%',
    paddingLeft: 10,
    paddingVertical: 5,
    paddingTop: 2,
  },
  logo: {
    width: 90,
    height: 40,
    objectFit: 'fill',
  },
  contentContainer: {
    width: '60%',
    padding: 10,
    paddingVertical: 5,
    textAlign: 'right',
    marginBottom: 10
  },
  orderInfo: {
    fontSize: 7,
    marginBottom: 3,
    textAlign: 'right',
  },
  barcodeContainer: {
    borderBottomWidth: 1,
    borderBottomColor: 'black',
    paddingHorizontal: 10,
    paddingVertical: 2,
    alignItems: 'center',
    textAlign: 'center',
  },
  barcodeText: {
    fontWeight: 900,
    marginBottom: 5,
    fontSize: 10,
    textAlign: 'center',
  },
  barcodeImage: {
    width: 200,
    height: 130,
    objectFit: 'fill',
    alignSelf: 'center',
  },
  addressContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottom: '1px solid black',
    padding: 5,
    paddingBottom: 10
  },
  address: {
    width: '70%',
  },
  delivery: {
    fontSize: 12,
    marginBottom: 20,
    fontWeight: 'bold',
  },
  deliveryContent: {
    fontSize: 8,
    marginBottom: 8,

  },
  prepaidRight: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'right',
    marginRight: 10,
  },
  tableContainer: {
    borderBottom: '1px solid black',
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    borderBottomStyle: 'solid',
  },
  tableHeaderText: {
    flex: 1, // Default flex
    fontSize: 8,
    textAlign: 'center',
    padding: 5,
    paddingBottom: 10,
    borderLeftWidth: 1,
    borderLeftColor: '#000',
    borderLeftStyle: 'solid',
  },
  noborder:{
  borderLeftWidth: 0,
},
  tableHeaderTextSerial: {
  flex: 0.2, // Less width for S.no
},
  tableHeaderTextSku: {
  flex: 0.5, // Less width for S.no
},
  tableHeaderTextQty: {
  flex: 0.2, // Less width for Qty
},
  tableHeaderTextDescription: {
  flex: 2, // More width for Item Description
},
  tableRow: {
  flexDirection: 'row',
  borderBottomWidth: 1,
  borderBottomColor: '#000',
  borderBottomStyle: 'solid',
},
  tableCell: {
  flex: 1, // Default flex
  fontSize: 6,
  textAlign: 'center',
  padding: 5,
  paddingBottom: 14,
  borderLeftWidth: 1,
  borderLeftColor: '#000',
  borderLeftStyle: 'solid',
  minHeight: 10, // Ensure minimum height
},
  tableCellSerial: {
  flex: 0.2, // Less width for S.no
},
  tableCellSku: {
  flex: 0.5, // Less width for S.no
},
  tableCellQty: {
  flex: 0.2, // Less width for Qty
},
  tableCellDescription: {
  flex: 2, // More width for Item Description
  textAlign: 'left',
},
  dimensions: {
  fontSize: 6,
  marginTop: 0,
  textAlign: 'center',
  paddingTop: 4,
  paddingBottom: 10,
},

  footer: {
  fontSize: 10,
  textAlign: 'center',
  paddingTop: 8,
},
  fo_text: {
  marginBottom: 8,
  fontSize: 8,
},
  disclaimer: {
  marginTop: 0,
  fontSize: 8,
  paddingLeft: 5,
  prepaidRight: 5,
  paddingBottom: 25,
},
});

export default MyDocument;
