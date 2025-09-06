import { MOCK_USER_COLLECTION } from "@/lib/constans";

import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Badge } from "@/components/ui/badge";
import { Shield, ExternalLink, MoreHorizontal, Gavel, Eye } from "lucide-react";
import { getStatusColor } from "@/lib/utils";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export const CollectionTab = () => {
  return (
    <Card className="bg-white/[0.05] border border-white/10 backdrop-blur-sm">
      <CardHeader>
        <CardTitle>My Domain Collection</CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Domain</TableHead>
              <TableHead>Purchase Price</TableHead>
              <TableHead>Purchase Date</TableHead>
              <TableHead>Estimated Value</TableHead>
              <TableHead>P&L</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {MOCK_USER_COLLECTION.map((item) => {
              const pnl = item.estimatedValue - item.purchasePrice;
              const pnlPercentage = ((pnl / item.purchasePrice) * 100).toFixed(1);
              return (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-medium">{item.domain}</span>
                      <Shield className="w-4 h-4 text-indigo-300" />
                    </div>
                  </TableCell>
                  <TableCell className="font-semibold">{item.purchasePrice} ETH</TableCell>
                  <TableCell>{item.purchaseDate}</TableCell>
                  <TableCell className="font-semibold text-indigo-300">{item.estimatedValue} ETH</TableCell>
                  <TableCell>
                    <div className={`font-semibold ${pnl >= 0 ? "text-green-400" : "text-red-400"}`}>
                      {pnl >= 0 ? "+" : ""}
                      {pnl.toFixed(1)} ETH
                      <div className="text-xs opacity-75">({pnlPercentage}%)</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(item.status)}>{item.status.charAt(0).toUpperCase() + item.status.slice(1)}</Badge>
                  </TableCell>
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
                          View Domain
                        </DropdownMenuItem>
                        {item.status === "owned" && (
                          <DropdownMenuItem>
                            <Gavel className="mr-2 h-4 w-4" />
                            List for Auction
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem>
                          <ExternalLink className="mr-2 h-4 w-4" />
                          View on ENS
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
