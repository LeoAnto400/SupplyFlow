import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function RegisterPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Create your organization</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="flex flex-col gap-6">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="organizationName">Organization name</FieldLabel>
              <Input id="organizationName" name="organizationName" required />
            </Field>
            <Field>
              <FieldLabel htmlFor="email">Admin email</FieldLabel>
              <Input id="email" name="email" type="email" autoComplete="email" required />
            </Field>
            <Field>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <Input id="password" name="password" type="password" autoComplete="new-password" required />
            </Field>
          </FieldGroup>
          <Button type="submit" className="w-full">
            Create account
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
