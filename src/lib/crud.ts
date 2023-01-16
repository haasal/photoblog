import { MongoClient, ServerApiVersion } from "mongodb";

const uri =
  "mongodb+srv://photoblog:yop6c4kN83e7C8Ky@cluster0.pbipqm3.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri);

export async function run(): Promise<string> {
  try {
    const images = client.db("photoblog").collection("images");
    const query = { title: "Brauner Pilz" };
    const movie = await images.findOne(query);
    return JSON.stringify(movie);
  } finally {
    await client.close();
  }
}
