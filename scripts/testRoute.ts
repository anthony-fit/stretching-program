async function test() {
  const r1 = await fetch("http://localhost:3000/src/components/system/AppErrorBoundary.tsx");
  console.log("AppErrorBoundary status:", r1.status);
  if (!r1.ok) {
    console.log(await r1.text());
  }

  const r2 = await fetch("http://localhost:3000/src/lib/errors/normalizeAIError.ts");
  console.log("normalizeAIError status:", r2.status);
  if (!r2.ok) {
    console.log(await r2.text());
  }
}
test();
