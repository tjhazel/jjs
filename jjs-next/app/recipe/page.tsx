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
        <CardTitle>Recipe Page</CardTitle>
        <CardDescription>Recipe description.</CardDescription>
      </CardHeader>
      <CardContent>Recipe Content</CardContent>
    </Card>
  );
}
