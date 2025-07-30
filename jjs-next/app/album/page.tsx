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
        <CardTitle>Album Page</CardTitle>
        <CardDescription>album description.</CardDescription>
      </CardHeader>
      <CardContent>album Content</CardContent>
    </Card>
  );
}
