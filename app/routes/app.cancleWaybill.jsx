import React, { useState } from "react";
import { Page, TextField, Button, Banner, Card, Text } from "@shopify/polaris";

export default function CancleWaybill() {
    const [awbNo, setAwbNo] = useState('');
    const [licenceKey, setLicenceKey] = useState('');
    const [loginId, setLoginId] = useState('');
    const [response, setResponse] = useState(null);
    const [jwtToken, setJwtToken] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

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

    const handleSubmit = async () => {
        let token = jwtToken;

        // If no JWT token, generate it
        if (!token) {
            token = await generateJwtToken();
        }

        if (!token) {
            console.error('Unable to generate JWT token.');
            return;
        }

        const requestData = {
            "Request": {
                "AWBNo": awbNo
            },
            "Profile": {
                "Api_type": "S",
                "LicenceKey": licenceKey,
                "LoginID": loginId
            }
        };

        const res = await fetch('https://apigateway-sandbox.bluedart.com/in/transportation/waybill/v1/CancelWaybill', {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'JWTToken': token,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData)
        });

        const data = await res.json();
        setResponse(data);

        if (data["error-response"] && data["error-response"].length > 0) {
            const errorResponse = data["error-response"][0];
            if (errorResponse.IsError) {
                const statusInfo = errorResponse.Status.map(status => status.StatusInformation).join(', ');
                setErrorMessage(statusInfo);
            } else {
                setErrorMessage('Unknown error occurred.');
            }
        } else if (data["CancelWaybillResult"]) {
            const result = data["CancelWaybillResult"];
            if (!result.IsError) {
                const statusInfo = result.Status.map(status => status.StatusInformation).join(', ');
                setErrorMessage(statusInfo);
            } else {
                setErrorMessage('An error occurred.');
            }
        } else {
            setErrorMessage('Unexpected response format.');
        }
    };

    return (
        <Page>
            <Text variant="headingXl" as="h4">Cancel Waybill</Text>
            <Card sectioned>
                <TextField
                    label="AWB Number"
                    value={awbNo}
                    onChange={(value) => setAwbNo(value)}
                    autoComplete="off"
                />
                <TextField
                    label="Login ID"
                    value={loginId}
                    onChange={(value) => setLoginId(value)}
                    autoComplete="off"
                />
                <TextField
                    label="Licence Key"
                    value={licenceKey}
                    onChange={(value) => setLicenceKey(value)}
                    autoComplete="off"
                />
                <Button onClick={handleSubmit}>Submit</Button>
            </Card>
            {errorMessage && (
                <Banner status="critical">
                    <p>{errorMessage}</p>
                </Banner>
            )}
            {response && !errorMessage && (
                <Card sectioned>
                    <pre>{JSON.stringify(response, null, 2)}</pre>
                </Card>
            )}
        </Page>
    );
}
