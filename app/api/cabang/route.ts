import { execFile } from "child_process";
import { promisify } from "util";
import { NextResponse } from "next/server";

const execFileAsync = promisify(execFile);

export async function GET() {
  const body = JSON.stringify({
    api_jsoncmonss: [
      {
        Request: "CABANGGADAI",
        noHP: "820000000021379",
        tanggalAwal: "0000-00-00",
        tanggalAkhir: "0000-00-00",
        latMulai: "0.00",
        lonMulai: "0.00",
        jamMulai: "-10:00:00",
      },
    ],
  });

  const { stdout } = await execFileAsync("curl", [
    "--silent",
    "--location",
    "--request",
    "GET",
    process.env.NSS_API_URL!,
    "--header",
    "Content-Type: application/json",
    "--data",
    body,
  ]);
  const cleaned = stdout.replace(
        /"alamat":"([\s\S]*?)",/g,
        (_, alamat) => {
            const fixed = alamat
            .replace(/\r/g, "")
            .replace(/\n/g, "\\n");

            return `"alamat":"${fixed}",`;
        }
        );

        const data = JSON.parse(cleaned);

        return NextResponse.json(data);
}