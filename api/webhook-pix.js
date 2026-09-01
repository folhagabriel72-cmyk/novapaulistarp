export default async function handler(req, res){
  if(req.method !== 'POST') return res.status(200).send('Webhook PIX ativo');
  const WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;
  try{
    const pixArray = req.body.pix || [];
    for(const pix of pixArray){
      await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: "Nova Paulista Bot",
          content: "@everyone",
          embeds: [{
            title: `🔥 PAGAMENTO CONFIRMADO AUTOMATICAMENTE!`,
            description: `TXID: ${pix.txid} - Valor R$ ${pix.valor}`,
            color: 3066993,
            timestamp: new Date().toISOString()
          }]
        })
      });
    }
    return res.status(200).json({ ok: true });
  }catch(e){
    return res.status(500).json({ error: e.message });
  }
}
