
export function getNssApiUrl(): string {
  const apiUrl = process.env.NSS_API_URL

  if (!apiUrl) {
    throw new Error('NSS_API_URL is not configured')
  }

  return apiUrl
}

export function getBranchRequestBody(latitude = 0, longitude = 0) {
  let data = JSON.stringify({
            "api_jsoncmonss": [
                {
                "Request": "CABANGGADAI",
                "noHP": "820000000021379",
                "tanggalAwal": "0000-00-00",
                "tanggalAkhir": "0000-00-00",
                "latMulai": "0.00",
                "lonMulai": "0.00",
                "jamMulai": "-10:00:00"
                }
            ]
            });
  return data;
}