import { db } from "@/prisma/db";

// These are the only classification values
// our application accepts.
const validStatuses = ["KNOWN", "ALMOST", "UNKNOWN"];

export async function POST(request: Request) {
  // Read the JSON sent by the browser.
  const body = await request.json();

  const wordId = body.wordId;
  const status = body.status;

  // Validate wordId.
  if (!Number.isInteger(wordId)) {
    return Response.json(
      { error: "wordId must be an integer" },
      { status: 400 }
    );
  }

  // Validate status.
  if (!validStatuses.includes(status)) {
    return Response.json(
      { error: "Invalid classification status" },
      { status: 400 }
    );
  }

  // Create a classification if this word has none.
  //
  // If one already exists for this wordId,
  // update its status instead.
  const classification =
    await db.orm.public.Classification.upsert({
      create: {
        wordId: wordId,
        status: status,
      },

      update: {
        status: status,
      },

      conflictOn: {
        wordId: wordId,
      },
    });

  // Send the saved database row back to the browser.
  return Response.json(classification);
}

export async function GET() {
  const classifications =
    await db.orm.public.Classification.all();

  return Response.json(classifications);
}