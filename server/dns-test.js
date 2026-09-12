import dns from "dns";

dns.resolveSrv(
  "_mongodb._tcp.cluster0.kulk36k.mongodb.net",
  (err, records) => {
    if (err) {
      console.error("DNS Error:", err);
      return;
    }

    console.log(records);
  }
);