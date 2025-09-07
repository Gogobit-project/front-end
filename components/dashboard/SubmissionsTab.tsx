import { MOCK_USER_SUBMISSIONS } from "@/lib/constans";

import Link from "next/link";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, MoreHorizontal, Eye, Edit, Trash2 } from "lucide-react";
import { getStatusColor } from "@/lib/utils";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useUserSubmissions } from "@/hooks/dashboard/useUserSubmissions";

export const SubmissionsTab = () => {
  const { submissions, isLoading } = useUserSubmissions();

  if (isLoading) {
    return <div className="text-center p-12">Loading submissions...</div>;
  }
  return (
    <Card className="bg-white/[0.05] border border-white/10 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Domain Submissions</CardTitle>
          <Button className="bg-indigo-500 text-white hover:brightness-110">
            <Link href="/submit">Submit New Domain</Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Domain</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Submitted</TableHead>

              <TableHead>Current Bid</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {submissions.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-mono">{item.domain}</TableCell>
                <TableCell>
                  <Badge className={getStatusColor(item.status)}>{item.status}</Badge>
                </TableCell>
                <TableCell>{item.submittedDate}</TableCell>
                <TableCell className="font-semibold">{item.currentBid}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                      {item.status === "Pending" && (
                        <>
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Submission
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Cancel Submission
                          </DropdownMenuItem>
                        </>
                      )}
                      {item.status === "Live" && (
                        <DropdownMenuItem asChild>
                          <Link href={`/auctions/${item.id}`}>
                            <ExternalLink className="mr-2 h-4 w-4" />
                            View Auction
                          </Link>
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
