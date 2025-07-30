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
        <CardTitle>Article Page</CardTitle>
        <CardDescription>View all articles.</CardDescription>
      </CardHeader>
      <CardContent>View Content</CardContent>
    </Card>
  );
}
