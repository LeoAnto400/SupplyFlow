import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Log in to SupplyFlow</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="flex flex-col gap-6">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input id="email" name="email" type="email" autoComplete="email" required />
            </Field>
            <Field>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <Input id="password" name="password" type="password" autoComplete="current-password" required />
            </Field>
          </FieldGroup>
          <Button type="submit" className="w-full">
            Log in
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
