import type { Metadata } from "next";
import { SearchPage } from "@/components/SearchPage";

export const metadata: Metadata = {
  title: "搜索",
};

export default function Page() {
  return <SearchPage />;
}
