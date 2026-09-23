// Import the Prisma database client that was generated
// when we initialized Prisma.
import { db } from "@/prisma/db";

// Next.js calls this function when someone makes
// a GET request to /api/words.
export async function GET() {

  // Ask PostgreSQL for every row in the Word model.
  //
  // db.orm     = Prisma ORM
  // public     = PostgreSQL's "public" schema
  // Word       = our Word model
  // all()      = return all Word rows
  const words = await db.orm.public.Word.all();

  // APIs normally send data as JSON.
  //
  // Next.js converts our JavaScript object/array
  // into an HTTP JSON response.
  return Response.json(words);
}