import { NextResponse } from 'next/server';

const isValidDomain = (domain) => {

  const regex = /^[a-zA-Z0-9_][a-zA-Z0-9_-]{0,61}[a-zA-Z0-9](?:\.[a-zA-Z0-9_][a-zA-Z0-9_-]{0,61}[a-zA-Z0-9])*$/;
  return regex.test(domain);
};

async function fetchSpfRecords(domain, depth = 0, maxDepth = 5) {
  if (depth > maxDepth) {
    return { 
      records: [], 
      errors: [`Maximum recursion depth (${maxDepth}) reached for ${domain}`] 
    };
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // Increased to 10 seconds
    
    const dnsResponse = await fetch(
      `https://dns.google/resolve?name=${encodeURIComponent(domain)}&type=TXT`,
      { 
        signal: controller.signal,
        headers: {
          'Accept': 'application/json'
        }
      }
    );
    
    clearTimeout(timeoutId);
    
    if (!dnsResponse.ok) {
      throw new Error(`DNS API responded with status: ${dnsResponse.status}`);
    }
    
    const dnsData = await dnsResponse.json();
    console.log('DNS Response for', domain, ':', JSON.stringify(dnsData, null, 2));

    // Handle NXDOMAIN or other DNS errors
    if (dnsData.Status !== 0) {
      const statusMessages = {
        1: 'Format error',
        2: 'Server failure',
        3: 'Non-existent domain (NXDOMAIN)',
        4: 'Not implemented',
        5: 'Refused'
      };
      const statusMsg = statusMessages[dnsData.Status] || `Unknown status ${dnsData.Status}`;
      return { 
        records: [], 
        errors: [`DNS lookup failed for ${domain}: ${statusMsg}`] 
      };
    }

    if (!dnsData.Answer || !Array.isArray(dnsData.Answer) || dnsData.Answer.length === 0) {
      return { 
        records: [], 
        errors: [`No TXT records found for ${domain}`] 
      };
    }

    // Extract and clean TXT records
    const txtRecords = dnsData.Answer
      .filter(record => record && record.type === 16 && record.data) // Type 16 = TXT
      .map((record) => {
        // Remove surrounding quotes and handle escaped quotes
        let data = record.data;
        if (typeof data === 'string') {
          data = data.replace(/^"|"$/g, '').replace(/\\"/g, '"');
        }
        return data;
      });
    
    console.log('All TXT Records for', domain, ':', txtRecords);
    
    // Find SPF records
    let spfRecords = txtRecords.filter((record) => 
      record && typeof record === 'string' && record.trim().startsWith('v=spf1')
    );
    
    if (spfRecords.length === 0) {
      return { 
        records: [], 
        errors: [`No SPF records found for ${domain} (found ${txtRecords.length} TXT records)`] 
      };
    }

 
    if (spfRecords.length > 1) {
      console.warn(`Multiple SPF records found for ${domain}, joining them`);
      const joinedRecord = spfRecords.join(' ');
      spfRecords = [joinedRecord];
    }

    return { records: spfRecords, errors: [] };
  } catch (error) {
    console.error(`Error checking SPF record for ${domain}:`, error);
    let errorMessage = `Failed to check SPF record for ${domain}`;
    
    if (error.name === 'AbortError') {
      errorMessage = `DNS lookup timed out for ${domain}`;
    } else if (error.message) {
      errorMessage = `${errorMessage}: ${error.message}`;
    }
    
    return { records: [], errors: [errorMessage] };
  }
}

export async function GET(request) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const domain = searchParams.get('domain');
    const includeDomain = searchParams.get('includeDomain');

    if (!domain && !includeDomain) {
      return NextResponse.json({ 
        error: 'Domain or includeDomain parameter is required' 
      }, { status: 400 });
    }

    const lookupDomain = domain || includeDomain;

    if (!isValidDomain(lookupDomain)) {
      return NextResponse.json({ 
        error: `Invalid domain format: ${lookupDomain}` 
      }, { status: 400 });
    }
    
    const isIncludeLookup = !!includeDomain;
    

    const { records: spfRecords, errors } = await fetchSpfRecords(lookupDomain);
    

    if (isIncludeLookup) {
      return NextResponse.json({ 
        domain: lookupDomain,
        spfRecords,
        errors,
        success: spfRecords.length > 0
      });
    }
    
    const processedRecords = [];
    const allErrors = [...errors];
    
    for (const record of spfRecords) {
      const parts = record.split(/\s+/).filter(p => p); 
      const processedParts = [];
      
      for (const part of parts) {
        if (part.startsWith('include:')) {
          const includedDomain = part.substring(8);
          processedParts.push({
            type: 'include',
            value: includedDomain,
            records: null,
            hasError: false
          });
        } else if (part.startsWith('redirect=')) {
          const redirectedDomain = part.substring(9);
          processedParts.push({
            type: 'redirect',
            value: redirectedDomain,
            records: null,
            hasError: false
          });
        } else {
          processedParts.push({
            type: 'other',
            value: part
          });
        }
      }
      
      processedRecords.push({
        domain: lookupDomain,
        record,
        parts: processedParts
      });
    }
    
    return NextResponse.json({ 
      domain: lookupDomain,
      processedRecords,
      allErrors,
      success: processedRecords.length > 0
    });
    
  } catch (error) {
    console.error('Error in SPF lookup:', error);
    return NextResponse.json({ 
      error: 'Failed to check SPF record',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}

