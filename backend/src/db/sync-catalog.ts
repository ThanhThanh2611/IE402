import fs from "fs";
import path from "path";
import { db } from "./index";
import { furnitureCatalog } from "./schema";
import { eq } from "drizzle-orm";

async function syncCatalog() {
  console.log("Starting Furniture Catalog Synchronization...");

  const modelsDir = path.join(__dirname, "../../../frontend/public/models");
  
  if (!fs.existsSync(modelsDir)) {
    console.error(`Directory not found: ${modelsDir}`);
    process.exit(1);
  }

  const files = fs.readdirSync(modelsDir).filter(f => f.endsWith(".glb"));
  console.log(`Found ${files.length} models in ${modelsDir}`);

  const categories = [
    { key: "sofa", patterns: ["sofa", "couch", "lounge"] },
    { key: "table", patterns: ["table", "desk", "coffee"] },
    { key: "chair", patterns: ["chair", "stool", "bench", "armchair"] },
    { key: "bed", patterns: ["bed"] },
    { key: "cabinet", patterns: ["cabinet", "bookcase", "wardrobe", "dresser", "drawer", "shelf", "stand", "sideboard"] },
    { key: "appliance", patterns: ["television", "washer", "dryer", "toaster", "fridge", "oven", "microwave", "lamp", "radiator", "speaker", "toaster", "radio"] },
    { key: "decor", patterns: ["plant", "rug", "painting", "decor", "books", "pillows", "plate", "cup", "trashcan"] },
  ];

  function getCategory(filename: string): any {
    const f = filename.toLowerCase();
    for (const cat of categories) {
      if (cat.patterns.some(p => f.includes(p))) {
        return cat.key;
      }
    }
    return "other";
  }

  function formatName(filename: string): string {
    // Remove .glb and convert camelCase/PascalCase to Title Case
    const name = filename.replace(".glb", "");
    return name
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, str => str.toUpperCase())
      .trim();
  }

  let added = 0;
  let updated = 0;

  for (const file of files) {
    const code = `MOD-${file.replace(".glb", "").toUpperCase()}`;
    const name = formatName(file);
    const category = getCategory(file);
    const model3dUrl = `/models/${file}`;

    // Check if exists
    const existing = await db
      .select()
      .from(furnitureCatalog)
      .where(eq(furnitureCatalog.code, code))
      .limit(1);

    if (existing.length > 0) {
      // Update
      await db
        .update(furnitureCatalog)
        .set({
          name,
          category,
          model3dUrl,
          updatedAt: new Date(),
        })
        .where(eq(furnitureCatalog.id, existing[0].id));
      updated++;
    } else {
      // Insert
      await db.insert(furnitureCatalog).values({
        code,
        name,
        category,
        model3dUrl,
        isActive: true,
      });
      added++;
    }
  }

  console.log(`Sync complete!`);
  console.log(`Added: ${added}`);
  console.log(`Updated: ${updated}`);
  process.exit(0);
}

syncCatalog().catch(err => {
  console.error("Sync failed:", err);
  process.exit(1);
});
