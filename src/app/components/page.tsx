import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { CodeBlock } from "@/components/ui/code-block";
import { DiffLine } from "@/components/ui/diff-line";
import { Navbar } from "@/components/ui/navbar";
import { ScoreRing } from "@/components/ui/score-ring";
import { Table, TableHeader, TableRow } from "@/components/ui/table-row";
import { ToggleDemo } from "./toggle-demo";

function SectionTitle({ children }: { children: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-bold text-accent-green">{"//"}</span>
      <span className="text-sm font-bold text-text-primary">{children}</span>
    </div>
  );
}

function ComponentRow({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-wrap items-center gap-4">{children}</div>;
}

const sampleCode = `function calculateTotal(items) {
  var total = 0;
  for (var i = 0; ...) {
    total = total + items[i].price;
  }
}`;

export default async function ComponentsPage() {
  return (
    <div className="min-h-screen bg-bg-page px-20 py-15 font-primary">
      <div className="flex flex-col gap-15">
        {/* Page Title */}
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-accent-green">{"//"}</span>
          <h1 className="text-2xl font-bold text-text-primary">
            component_library
          </h1>
        </div>

        {/* buttons */}
        <section className="flex flex-col gap-6">
          <SectionTitle>buttons</SectionTitle>
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-3">
              <span className="text-xs text-text-tertiary">variants</span>
              <ComponentRow>
                <Button variant="primary">$ roast_my_code</Button>
                <Button variant="secondary">$ share_roast</Button>
                <Button variant="outline">$ view_all &gt;&gt;</Button>
                <Button variant="ghost">$ cancel</Button>
                <Button variant="destructive">$ delete</Button>
              </ComponentRow>
            </div>
            <div className="flex flex-col gap-3">
              <span className="text-xs text-text-tertiary">sizes</span>
              <ComponentRow>
                <Button size="sm">$ small</Button>
                <Button size="md">$ medium</Button>
                <Button size="lg">$ large</Button>
              </ComponentRow>
            </div>
            <div className="flex flex-col gap-3">
              <span className="text-xs text-text-tertiary">disabled</span>
              <ComponentRow>
                <Button disabled variant="primary">
                  $ disabled
                </Button>
                <Button disabled variant="secondary">
                  $ disabled
                </Button>
                <Button disabled variant="outline">
                  $ disabled
                </Button>
              </ComponentRow>
            </div>
          </div>
        </section>

        {/* toggle */}
        <section className="flex flex-col gap-6">
          <SectionTitle>toggle</SectionTitle>
          <ToggleDemo />
        </section>

        {/* badges */}
        <section className="flex flex-col gap-6">
          <SectionTitle>badges</SectionTitle>
          <ComponentRow>
            <Badge variant="critical">critical</Badge>
            <Badge variant="warning">warning</Badge>
            <Badge variant="good">good</Badge>
            <Badge variant="critical">needs_serious_help</Badge>
          </ComponentRow>
        </section>

        {/* cards */}
        <section className="flex flex-col gap-6">
          <SectionTitle>cards</SectionTitle>
          <Card className="max-w-[480px]">
            <Badge variant="critical">critical</Badge>
            <CardTitle>using var instead of const/let</CardTitle>
            <CardDescription>
              the var keyword is function-scoped rather than block-scoped, which
              can lead to unexpected behavior and bugs. modern javascript uses
              const for immutable bindings and let for mutable ones.
            </CardDescription>
          </Card>
        </section>

        {/* code_block */}
        <section className="flex flex-col gap-6">
          <SectionTitle>code_block</SectionTitle>
          <CodeBlock
            code={sampleCode}
            lang="javascript"
            filename="calculate.js"
            className="max-w-[560px]"
          />
        </section>

        {/* diff_lines */}
        <section className="flex flex-col gap-6">
          <SectionTitle>diff_lines</SectionTitle>
          <div className="flex max-w-[560px] flex-col">
            <DiffLine variant="removed">var total = 0;</DiffLine>
            <DiffLine variant="added">const total = 0;</DiffLine>
            <DiffLine variant="context">
              {"for (let i = 0; i < items.length; i++) {"}
            </DiffLine>
          </div>
        </section>

        {/* table_row */}
        <section className="flex flex-col gap-6">
          <SectionTitle>table_row</SectionTitle>
          <Table>
            <TableHeader>
              <TableHeader.Cell className="w-10">#</TableHeader.Cell>
              <TableHeader.Cell className="w-15">score</TableHeader.Cell>
              <TableHeader.Cell className="flex-1">code</TableHeader.Cell>
              <TableHeader.Cell className="w-25">lang</TableHeader.Cell>
            </TableHeader>
            <TableRow>
              <TableRow.Rank>#1</TableRow.Rank>
              <TableRow.Score className="text-accent-red">2.1</TableRow.Score>
              <TableRow.Code>
                function calculateTotal(items) {"{ var total = 0; ..."}
              </TableRow.Code>
              <TableRow.Language>javascript</TableRow.Language>
            </TableRow>
            <TableRow>
              <TableRow.Rank>#2</TableRow.Rank>
              <TableRow.Score className="text-accent-amber">5.4</TableRow.Score>
              <TableRow.Code>
                const result = await fetch(url).then(r =&gt; r.json())
              </TableRow.Code>
              <TableRow.Language>typescript</TableRow.Language>
            </TableRow>
            <TableRow>
              <TableRow.Rank>#3</TableRow.Rank>
              <TableRow.Score className="text-accent-green">8.7</TableRow.Score>
              <TableRow.Code>
                export function parseConfig(path: string): Config {"{ ... }"}
              </TableRow.Code>
              <TableRow.Language>typescript</TableRow.Language>
            </TableRow>
          </Table>
        </section>

        {/* navbar */}
        <section className="flex flex-col gap-6">
          <SectionTitle>navbar</SectionTitle>
          <Navbar links={[{ label: "leaderboard", href: "#" }]} />
        </section>

        {/* score_ring */}
        <section className="flex flex-col gap-6">
          <SectionTitle>score_ring</SectionTitle>
          <ComponentRow>
            <ScoreRing score={3.5} />
            <ScoreRing score={7.2} />
            <ScoreRing score={9.8} />
          </ComponentRow>
        </section>
      </div>
    </div>
  );
}
