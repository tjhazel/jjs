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
        <CardTitle>Admin Page</CardTitle>
        <CardDescription>Admin description.</CardDescription>
      </CardHeader>
      <CardContent>Admin Content</CardContent>
    </Card>
  );
}
