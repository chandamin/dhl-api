import React, { useState } from 'react';
import { Page, Card, DataTable, Button } from '@shopify/polaris';
import { useLoaderData } from '@remix-run/react';
import { json } from '@remix-run/react';
import shopify from '../shopify.server';
import GenerateWaybill from './app.generateWaybill';

export async function loader({ request }) {
  const { admin, session } = await shopify.authenticate.admin(request);
  const data = await admin.rest.resources.Order.all({ session: session, status: "any" });
  return json(data.data);
}

// Helper function to format the order date
const formatOrderDate = (date) => {
  const orderDate = new Date(date);
  return `${orderDate.toLocaleDateString()} at ${orderDate.toLocaleTimeString()}`;
};

// Helper function to format the order total price with currency symbol
const formatTotalPrice = (amount, currencyCode) => {
  const currencySymbol = currencyCode === 'INR' ? '₹' : '$';
  return `${currencySymbol}${amount}`;
};

// Function to format the order data
const formatOrderData = (order, handleWaybillClick) => {
  return [
    order.order_number || 'N/A',
    formatOrderDate(order.created_at),
    `${order.customer.first_name || 'N/A'} ${order.customer.last_name || 'N/A'}`,
    formatTotalPrice(order.current_total_price, order.currency),
    order.financial_status || 'N/A',
    `${order.line_items.length} items`,
    'Unfulfilled', // Placeholder, adjust as necessary
    'Shipping', // Placeholder, adjust as necessary
    <Button onClick={() => handleWaybillClick(order)}>Shipping Print</Button>
  ];
};

export default function Index() {
  const orders = useLoaderData();
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Handle waybill generation click
  const handleWaybillClick = (order) => {
    setSelectedOrder(order);
  };

  // Format rows for the DataTable
  const rows = orders.map(order => formatOrderData(order, handleWaybillClick));

  return (
    <Page title="Orders">
      <Card>
        <DataTable
          columnContentTypes={[
            'text',   // Order
            'text',   // Date
            'text',   // Customer
            'text',   // Total
            'text',   // Payment status
            'text',   // Items
            'text',   // Delivery status
            'text',   // Delivery method
            'text'    // Actions (Button)
          ]}
          headings={[
            'Order',
            'Date',
            'Customer',
            'Total',
            'Payment Status',
            'Items',
            'Delivery Status',
            'Delivery Method',
            'Actions'
          ]}
          rows={rows}
        />
      </Card>
      {selectedOrder && (
        <GenerateWaybill
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)} // Optionally add a close handler
        />
      )}
    </Page>
  );
}
