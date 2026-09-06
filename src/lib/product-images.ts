import sourdough from "@/assets/product-sourdough.jpg";
import baguette from "@/assets/product-baguette.jpg";
import multigrain from "@/assets/product-multigrain.jpg";
import focaccia from "@/assets/product-focaccia.jpg";
import rye from "@/assets/product-rye.jpg";
import brioche from "@/assets/product-brioche.jpg";
import milkbread from "@/assets/product-milkbread.jpg";
import croissant from "@/assets/product-croissant.jpg";
import painauchocolat from "@/assets/product-painauchocolat.jpg";
import cinnamonroll from "@/assets/product-cinnamon-roll.jpg";
import danish from "@/assets/product-danish.jpg";
import vegpuff from "@/assets/product-vegpuff.jpg";
import chocolatecake from "@/assets/product-chocolate-cake.jpg";
import blackforest from "@/assets/product-blackforest.jpg";
import cheesecake from "@/assets/product-cheesecake.jpg";
import cupcake from "@/assets/product-cupcake.jpg";
import celebration from "@/assets/product-celebration.jpg";
import cookies from "@/assets/product-cookies.jpg";
import macarons from "@/assets/product-macarons.jpg";
import shortbread from "@/assets/product-shortbread.jpg";

export const productImages: Record<string, string> = {
  sourdough,
  baguette,
  multigrain,
  focaccia,
  rye,
  brioche,
  milkbread,
  croissant,
  painauchocolat,
  cinnamonroll,
  danish,
  vegpuff,
  chocolatecake,
  blackforest,
  cheesecake,
  cupcake,
  celebration,
  cookies,
  macarons,
  shortbread,
};

export function imageFor(key: string) {
  return productImages[key] ?? sourdough;
}

export const CATEGORIES = ["Breads", "Pastries", "Cakes", "Cookies"] as const;

export const categorySlug = (c: string) => c.toLowerCase();

export function rupees(value: number | string) {
  const n = typeof value === "string" ? Number(value) : value;
  return `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
}
