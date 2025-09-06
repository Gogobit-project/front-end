import { MOCK_USER_SUBMISSIONS } from "@/lib/constans";

import Link from "next/link";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Badge } from "@/components/ui/badge";
import { Shield, ExternalLink, MoreHorizontal, Gavel, Eye, Edit, Trash2 } from "lucide-react";
import { getStatusColor } from "@/lib/utils";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export const SubmissionsTab = () => {
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
              <TableHead>Starting Bid</TableHead>
              <TableHead>Current Bid</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {MOCK_USER_SUBMISSIONS.map((submission) => (
              <TableRow key={submission.id}>
                <TableCell>
                  <span className="font-mono font-medium">{submission.domain}</span>
                </TableCell>
                <TableCell>
                  <Badge className={getStatusColor(submission.status)}>{submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}</Badge>
                </TableCell>
                <TableCell>{submission.submittedDate}</TableCell>
                <TableCell className="font-semibold">{submission.startingBid} ETH</TableCell>
                <TableCell className="font-semibold text-indigo-300">{submission.currentBid ? `${submission.currentBid} ETH` : "-"}</TableCell>
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
                      {submission.status === "pending" && (
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
                      {submission.status === "live" && (
                        <DropdownMenuItem asChild>
                          <Link href={`/auctions/${submission.id}`}>
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
