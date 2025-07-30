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
        <CardTitle>Home Page</CardTitle>
        <CardDescription>something splashy here</CardDescription>
      </CardHeader>
      <CardContent>main card content here</CardContent>
    </Card>
  );
}
