import https from 'https';

const CLIENT_ID = process.env.EFI_CLIENT_ID;
const CLIENT_SECRET = process.env.EFI_CLIENT_SECRET;
const CERT_BASE64 = process.env.EFI_CERT_BASE64;
const PIX_KEY = process.env.EFI_PIX_KEY || "felipemellocouto@outlook.com";

async function getToken(){
  const cred = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');
  return new Promise((resolve, reject)=>{
    const req = https.request({
      hostname: 'pix.api.efipay.com.br',
      path: '/oauth/token',
      method: 'POST',
      headers: { 'Authorization': `Basic ${cred}`, 'Content-Type': 'application/json' }
    }, res=>{ let d=''; res.on('data', c=>d+=c); res.on('end', ()=>resolve(JSON.parse(d).access_token)); });
    req.on('error', reject);
    req.write(JSON.stringify({ grant_type: 'client_credentials' }));
    req.end();
  });
}

export default async function handler(req, res){
  try{
    const token = await getToken();
    const certBuffer = Buffer.from(CERT_BASE64, 'base64');
    
    const body = JSON.stringify({ webhookUrl: "https://novapaulistarp.vercel.app/api/webhook-pix" });
    
    const result = await new Promise((resolve, reject)=>{
      const r = https.request({
        hostname: 'pix.api.efipay.com.br',
        path: `/v2/webhook/${PIX_KEY}`,
        method: 'PUT',
        pfx: certBuffer,
        passphrase: '',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) }
      }, resp=>{ let d=''; resp.on('data', c=>d+=c); resp.on('end', ()=>resolve({ status: resp.statusCode, body: d })); });
      r.on('error', reject);
      r.write(body);
      r.end();
    });

    return res.status(200).json({ message: 'Webhook registrado!', result });
  }catch(e){
    return res.status(500).json({ error: e.message });
  }
}
