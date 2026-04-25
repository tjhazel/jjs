import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';

export default function CustomersPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Things Page</CardTitle>
        <CardDescription>Things description.</CardDescription>
      </CardHeader>
      <CardContent>Things Content</CardContent>
    </Card>
  );
}
