"use client";

import React, { useState } from 'react';
import { AptickClient } from 'aptick-sdk';

interface TestResult {
  name: string;
  status: 'pending' | 'success' | 'error';
  result?: any;
  error?: string;
  duration?: number;
}

// Simple test component without provider dependency
function SDKTester() {
  const [testResult, setTestResult] = useState<string>('');
  const [client, setClient] = useState<AptickClient | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [tests, setTests] = useState<TestResult[]>([]);

  const runTest = async (name: string, testFn: () => Promise<any>) => {
    const startTime = Date.now();
    try {
      const result = await testFn();
      const duration = Date.now() - startTime;
      return { name, status: 'success' as const, result, duration };
    } catch (error) {
      const duration = Date.now() - startTime;
      return { name, status: 'error' as const, error: String(error), duration };
    }
  };

  const runAllTests = async () => {
    setIsRunning(true);
    setTests([]);
    const testResults: TestResult[] = [];

    // Test 1: Initialize SDK
    const initTest = await runTest('Initialize SDK', async () => {
      const aptickClient = new AptickClient({
        network: 'devnet',
        contractAddress: '0x72780903f4ca64d29bf9fcd1be4b863190d76d25cc5efd176ee4b119732419c1'
      });
      setClient(aptickClient);
      return { 
        network: aptickClient.network, 
        contractAddress: aptickClient.contractAddress,
        moduleAddress: aptickClient.moduleAddress
      };
    });
    testResults.push(initTest);
    setTests([...testResults]);

    if (initTest.status === 'success' && client) {
      // Test 2: Network Configuration
      const networkTest = await runTest('Network Configuration', async () => {
        return {
          network: client.network,
          isValidNetwork: ['mainnet', 'testnet', 'devnet', 'local'].includes(client.network)
        };
      });
      testResults.push(networkTest);
      setTests([...testResults]);

      // Test 3: Contract Address Validation
      const contractTest = await runTest('Contract Address Validation', async () => {
        const address = client.contractAddress;
        return {
          address,
          isValidFormat: address.startsWith('0x') && address.length === 66,
          length: address.length
        };
      });
      testResults.push(contractTest);
      setTests([...testResults]);

      // Test 4: SDK Methods Availability
      const methodsTest = await runTest('SDK Methods Available', async () => {
        const methods = [
          'getProviderInfo',
          'registerProvider', 
          'depositToEscrow',
          'recordUsage',
          'getEscrowBalance',
          'withdrawFromEscrow'
        ];
        
        const availableMethods = methods.filter(method => 
          typeof (client as any)[method] === 'function'
        );
        
        return {
          expectedMethods: methods,
          availableMethods,
          allMethodsPresent: availableMethods.length === methods.length
        };
      });
      testResults.push(methodsTest);
      setTests([...testResults]);

      // Test 5: Utility Functions
      const utilsTest = await runTest('Utility Functions', async () => {
        const utils = client.utils;
        return {
          hasUtils: !!utils,
          aptToOctas: utils ? typeof utils.aptToOctas === 'function' : false,
          octasToApt: utils ? typeof utils.octasToApt === 'function' : false,
          isValidAddress: utils ? typeof utils.isValidAddress === 'function' : false
        };
      });
      testResults.push(utilsTest);
      setTests([...testResults]);
    }

    setIsRunning(false);
    
    // Summary
    const successCount = testResults.filter(t => t.status === 'success').length;
    const totalTests = testResults.length;
    const summary = `\n🎯 Test Summary: ${successCount}/${totalTests} tests passed\n${
      successCount === totalTests ? '✅ All tests passed! SDK is ready.' : '⚠️ Some tests failed. Check details below.'
    }`;
    
    setTestResult(summary);
  };

  const initializeSDK = async () => {
    try {
      const aptickClient = new AptickClient({
        network: 'devnet',
        contractAddress: '0x72780903f4ca64d29bf9fcd1be4b863190d76d25cc5efd176ee4b119732419c1'
      });
      
      setClient(aptickClient);
      setTestResult('✅ SDK initialized successfully!');
    } catch (error) {
      setTestResult(`❌ Initialization Error: ${error}`);
    }
  };

  return (
    <div className="p-6 border rounded-lg bg-white shadow-sm">
      <h2 className="text-xl font-bold mb-4 text-gray-800">🧪 Comprehensive SDK Test Suite</h2>
      
      <div className="space-y-3 mb-4">
        <div className="flex gap-3">
          <button 
            onClick={initializeSDK}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded transition-colors"
          >
            Quick Initialize
          </button>
          
          <button 
            onClick={runAllTests}
            disabled={isRunning}
            className={`px-4 py-2 rounded transition-colors ${
              isRunning
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
          >
            {isRunning ? '🔄 Running Tests...' : '🚀 Run Full Test Suite'}
          </button>
        </div>
        
        <div className="text-sm">
          <span className="font-medium">Status:</span> 
          <span className={client ? 'text-green-600' : 'text-gray-500'}>
            {client ? '✅ SDK Ready' : '⏳ Not Initialized'}
          </span>
        </div>
      </div>

      {/* Test Results */}
      {tests.length > 0 && (
        <div className="mb-4">
          <h3 className="font-medium text-gray-700 mb-2">Test Results:</h3>
          <div className="space-y-2">
            {tests.map((test, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <div className="flex items-center gap-2">
                  <span className={test.status === 'success' ? 'text-green-600' : 'text-red-600'}>
                    {test.status === 'success' ? '✅' : '❌'}
                  </span>
                  <span className="font-medium">{test.name}</span>
                </div>
                <span className="text-xs text-gray-500">
                  {test.duration}ms
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {testResult && (
        <div className="mt-4">
          <div className="font-medium text-gray-700 mb-2">Result:</div>
          <pre className="p-3 bg-gray-50 rounded text-sm overflow-auto whitespace-pre-wrap border">
            {testResult}
          </pre>
        </div>
      )}

      {/* Test Details */}
      {tests.length > 0 && (
        <details className="mt-4">
          <summary className="cursor-pointer font-medium text-gray-700 hover:text-gray-900">
            📊 Detailed Test Results
          </summary>
          <div className="mt-2 space-y-2">
            {tests.map((test, index) => (
              <div key={index} className="border rounded p-3 bg-gray-50">
                <div className="font-medium text-sm mb-1">{test.name}</div>
                {test.result && (
                  <pre className="text-xs text-green-700 bg-green-50 p-2 rounded">
                    {JSON.stringify(test.result, null, 2)}
                  </pre>
                )}
                {test.error && (
                  <pre className="text-xs text-red-700 bg-red-50 p-2 rounded">
                    {test.error}
                  </pre>
                )}
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}

// Main component - no provider needed for basic testing
export default function LocalSDKTest() {
  return (
    <div className="w-full">
      <SDKTester />
    </div>
  );
}