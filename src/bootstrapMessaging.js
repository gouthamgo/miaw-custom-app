"use client";

import { useState, useEffect } from "react";

// Import children components to render.
import MessagingWindow from "./components/messagingWindow";
import MessagingButton from "./components/messagingButton";

import './bootstrapMessaging.css';

import { storeOrganizationId, storeDeploymentDeveloperName, storeSalesforceMessagingUrl } from './services/dataProvider';
import { determineStorageType, initializeWebStorage, getItemInWebStorageByKey, getItemInPayloadByKey } from './helpers/webstorageUtils';
import { APP_CONSTANTS, STORAGE_KEYS } from './helpers/constants';

import Draggable from "./ui-effects/draggable";

export default function BootstrapMessaging() {
    let [shouldShowMessagingButton, setShowMessagingButton] = useState(false);
    let [orgId, setOrgId] = useState('00DOg000001PcHd');
    let [deploymentDevName, setDeploymentDevName] = useState('check');
    let [messagingURL, setMessagingURL] = useState('https://takingshape--miaw.sandbox.my.salesforce-scrt.com');
    let [shouldDisableMessagingButton, setShouldDisableMessagingButton] = useState(false);
    let [shouldShowMessagingWindow, setShouldShowMessagingWindow] = useState(false);
    let [showMessagingButtonSpinner, setShowMessagingButtonSpinner] = useState(false);
    let [isExistingConversation, setIsExistingConversation] = useState(false);

    useEffect(() => {
    // Initialize messaging client immediately with hardcoded values
    initializeMessagingClient('00DOg000001PcHd', 'check', 'https://takingshape--miaw.sandbox.my.salesforce-scrt.com');
    
    const storage = determineStorageType();
    if (!storage) {
        console.error(`Cannot initialize the app. Web storage is required for the app to function.`);
        return;
    }

    const messaging_webstorage_key = Object.keys(storage).filter(item => item.startsWith(APP_CONSTANTS.WEB_STORAGE_KEY))[0];

    if (messaging_webstorage_key) {
        // Existing conversation logic
        const webStoragePayload = storage.getItem(messaging_webstorage_key);
        const messagingJwt = getItemInWebStorageByKey(STORAGE_KEYS.JWT);
        if (messagingJwt) {
            setIsExistingConversation(true);
            setShouldShowMessagingWindow(true); // Auto-show existing conversation
        }
    } 
    
    // Auto-start new conversation immediately
    console.log("Auto-starting chat conversation...");
    setShowMessagingButtonSpinner(true);
    
    // Simulate the "Let's Chat" button click after a brief delay
    setTimeout(() => {
        handleMessagingButtonClick({ preventDefault: () => {} });
    }, 1000);

    return () => {
        showMessagingWindow(false);
    };
// eslint-disable-next-line react-hooks/exhaustive-deps
}, []);

    /**
     * Initialize the messaging client by
     * 1. internally initializing the Embedded Service deployment paramaters in-memory.
     * 2. initializing Salesforce Organization Id in the browser web storage.
     */
    function initializeMessagingClient(ord_id, deployment_dev_name, messaging_url) {
        // Initialize helpers.
        initializeWebStorage(ord_id || orgId);
        storeOrganizationId(ord_id || orgId);
        storeDeploymentDeveloperName(deployment_dev_name || deploymentDevName);
        storeSalesforceMessagingUrl(messaging_url || messagingURL);
    }

    /**
     * Validates whether the supplied string is a valid Salesforce Organization Id.
     * @returns {boolean}
     */
    function isValidOrganizationId(id) {
        return typeof id === "string" && (id.length === 18 || id.length === 15) && id.substring(0, 3) === APP_CONSTANTS.ORGANIZATION_ID_PREFIX;
    }

    /**
     * Validates whether the supplied string is a valid Salesforce Embedded Service Deployment Developer Name.
     * @returns {boolean}
     */
    function isValidDeploymentDeveloperName(name) {
        return typeof name === "string" && name.length > 0;
    }

    /**
     * Determines whether the supplied url is a Salesforce Url.
     * @returns {boolean}
     */
    function isSalesforceUrl(url) {
        try {
            return typeof url === "string" && url.length > 0 && url.slice(-19) === APP_CONSTANTS.SALESFORCE_MESSAGING_SCRT_URL;
        } catch (err) {
            console.error(`Something went wrong in validating whether the url is a Salesforce url: ${err}`);
            return false;
        }
    }

    /**
     * Validates whether the supplied string has a valid protocol and is a Salesforce Url.
     * @returns {boolean}
     */
    function isValidUrl(url) {
        try {
            const urlToValidate = new URL(url);
            return isSalesforceUrl(url) && urlToValidate.protocol === APP_CONSTANTS.HTTPS_PROTOCOL;
        } catch (err) {
            console.error(`Something went wrong in validating the url provided: ${err}`);
            return false;
        }
    }

    /**
     * Handle a click action from the Deployment-Details-Form Submit Button. If the inputted parameters are valid, initialize the Messaging Client and render the Messaging Button.
     * @param {object} evt - button click event
     */
    function handleDeploymentDetailsFormSubmit(evt) {
        if (evt) {
            if(!isValidOrganizationId(orgId)) {
                alert(`Invalid OrganizationId Input Value: ${orgId}`);
                setShowMessagingButton(false);
                return;
            }
		    if(!isValidDeploymentDeveloperName(deploymentDevName)) {
                alert(`Expected a valid Embedded Service Deployment Developer Name value to be a string but received: ${deploymentDevName}.`);
                setShowMessagingButton(false);
                return;
            }
		    if(!isValidUrl(messagingURL)) {
                alert(`Expected a valid Salesforce Messaging URL value to be a string but received: ${messagingURL}.`);
                setShowMessagingButton(false);
                return;
            }

            // Initialize the Messaging Client.
            initializeMessagingClient();
            // New conversation.
            setIsExistingConversation(false);
            // Render the Messaging Button.
            setShowMessagingButton(true);
        }
    }

    /**
     * Determines whether the Deployment-Details-Form Submit Button should be enabled/disabled.
     * @returns {boolean} TRUE - disabled the button and FALSE - otherwise
     */
    function shouldDisableFormSubmitButton() {
        return (orgId && orgId.length === 0) || (deploymentDevName && deploymentDevName.length === 0) || (messagingURL && messagingURL.length === 0);
    }

    /**
     * Handle a click action from the Messaging Button.
     * @param {object} evt - button click event
     */
    function handleMessagingButtonClick(evt) {
        if (evt) {
            console.log("Messaging Button clicked.");
            setShowMessagingButtonSpinner(true);
            showMessagingWindow(true);
        }
    }

    /**
     * Determines whether to render the Messaging Window based on the supplied parameter.
     * @param {boolean} shouldShow - TRUE - render the Messaging WINDOW and FALSE - Do not render the Messaging Window & Messaging Button
     */
    function showMessagingWindow(shouldShow) {
        setShouldShowMessagingWindow(Boolean(shouldShow));
        if (!shouldShow) {
            // Enable Messaging Button again when Messaging Window is closed.
            setShouldDisableMessagingButton(false);
            // Remove the spinner on the Messaging Button.
            setShowMessagingButtonSpinner(false);
            // Hide Messaging Button to re-initialize the client with form submit.
            setShowMessagingButton(false);
        }
    }

    /**
     * Handles the app UI readiness i.e. Messaging Button updates based on whether the Messaging Window UI is rendered.
     * @param {boolean} isReady - TRUE - disable the Messaging Button & remove the spinner and FALSE - otherwise.
     */
    function appUiReady(isReady) {
        // Disable Messaging Button if the app is UI ready.
        setShouldDisableMessagingButton(isReady);
        // Remove the spinner on the Messaging Button if the app is UI ready.
        setShowMessagingButtonSpinner(!isReady);
    }

    return (
    <>
        {/* Show loading message while auto-starting */}
        {!shouldShowMessagingWindow && (
            <div style={{ 
                textAlign: 'center', 
                padding: '20px',
                color: '#666',
                fontSize: '14px'
            }}>
                <div style={{ marginBottom: '10px' }}>Starting chat...</div>
                <div className="spinner" style={{
                    width: '30px',
                    height: '30px',
                    border: '3px solid #f3f3f3',
                    borderTop: '3px solid #3fc56e',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                    margin: '0 auto'
                }}></div>
            </div>
        )}
        
        {shouldShowMessagingWindow &&
            <div style={{ width: '100%', height: '100vh' }}>
                <MessagingWindow
                    isExistingConversation={isExistingConversation}
                    showMessagingWindow={showMessagingWindow}
                    deactivateMessagingButton={appUiReady} />
            </div>
        }
    </>
);
}