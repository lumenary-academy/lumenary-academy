import { RootLocalePage } from "@lumenary/core/site";

/** `/` picks a language: a remembered choice, else the browser's preferences, else English. */
export default function RootPage() {
  return <RootLocalePage title="Lumenary Academy" tagline="Three divisions: Lumenary Scientia, Lumenary Lingua and Lumenary Prep." />;
}
