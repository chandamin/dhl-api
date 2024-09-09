import React, { useState, useCallback } from "react";
import { Page, Card, DataTable, Banner, Text, TextField, Button } from "@shopify/polaris";

export default function ProductDetails() {
    const [products, setProducts] = useState([]);
    const [errorMessage, setErrorMessage] = useState('');
    const [jwtToken, setJwtToken] = useState('');
    const [licenceKey, setLicenceKey] = useState('');
    const [loginID, setLoginID] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);

    // Static Client ID and Client Secret
    const clientID = '5jRX1SsJtBujJ2YozVldsGJYd0WgmEQG';
    const clientSecret = 'comCncWQyG5sYERR';

    const generateJwtToken = async () => {
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
                return data.JWTToken;
            } else {
                console.error('Failed to generate JWT token:', data);
            }
        } catch (error) {
            console.error('Error generating JWT token:', error);
        }
        return null;
    };

    const fetchProducts = useCallback(async () => {
        let token = await generateJwtToken();

        const res = await fetch('https://apigateway-sandbox.bluedart.com/in/transportation/allproduct/v1/GetAllProductsAndSubProducts', {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'JWTToken': token,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                profile: {
                    Api_type: 'S',
                    LicenceKey: licenceKey,
                    LoginID: loginID
                }
            })
        });

        const data = await res.json();
        console.log(data);

        if (data.GetAllProductsAndSubProductsResult && !data.GetAllProductsAndSubProductsResult.IsError) {
            const productList = data.GetAllProductsAndSubProductsResult.ProductList;
            setProducts(productList);
            setErrorMessage('');
        } else {
            setErrorMessage('No products found or error fetching data.');
        }
    }, [licenceKey, loginID, generateJwtToken]);

    const handleSubmit = () => {
        setIsSubmitted(true);
        fetchProducts();
    };

    const productTable = products.length > 0 ? (
        <DataTable
            columnContentTypes={[
                'text',
                'text'
            ]}
            headings={['Product Name', 'Sub-Products']}
            rows={products.map(product => [
                product.ProductName,
                product.SubProducts.join(', ')
            ])}
        />
    ) : null;

    return (
        <Page>
            <Text variant="headingXl" as="h4">Product Details</Text>
            <Card sectioned>
                <TextField
                    label="Licence Key"
                    value={licenceKey}
                    onChange={(value) => setLicenceKey(value)}
                    autoComplete="off"
                />
                <TextField
                    label="Login ID"
                    value={loginID}
                    onChange={(value) => setLoginID(value)}
                    autoComplete="off"
                />
                <Button onClick={handleSubmit}>Fetch Product Details</Button>
            </Card>
            {errorMessage && (
                <Banner status="critical">
                    <p>{errorMessage}</p>
                </Banner>
            )}
            {isSubmitted && productTable}
        </Page>
    );
}
