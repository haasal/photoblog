import { db } from "./mongo";
import { Err, Ok, Result } from "./result";

// doesn't check if collection exists
export async function isPrivate(collection: string): Promise<
  Result<{
    private: boolean;
    password: string;
  }>
> {
  let cur = db.collection("test").aggregate([
    {
      $match: { title: collection },
    },
    {
      $project: {
        _id: 0,
        password: { $ifNull: ["$password", ""] },
        private: {
          $in: [true, "$images.private"],
        },
      },
    },
  ]);

  const result = await cur.next();

  if (!result) {
    return Err("collection not found");
  }

  return Ok({ private: result.private, password: result.password });
}
