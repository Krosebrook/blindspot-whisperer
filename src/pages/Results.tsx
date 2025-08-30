import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, 
  Filter, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Eye,
  Share2,
  Download,
  BarChart3
} from "lucide-react";

interface BlindSpotResult {
  id: string;
  title: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  status: 'new' | 'in-progress' | 'resolved';
  category: string;
  description: string;
  confidence: number;
  createdAt: string;
  persona: string;
  scanTitle: string;
}

export default function Results() {
  const [results, setResults] = useState<BlindSpotResult[]>([]);
  const [filteredResults, setFilteredResults] = useState<BlindSpotResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  useEffect(() => {
    // Simulate loading results data
    setTimeout(() => {
      const mockResults: BlindSpotResult[] = [
        {
          id: '1',
          title: 'Customer Churn Analysis Gap',
          severity: 'critical',
          status: 'new',
          category: 'Customer Retention',
          description: 'No systematic approach to identify early churn indicators in your customer base.',
          confidence: 89,
          createdAt: '2 hours ago',
          persona: 'SaaS Founder',
          scanTitle: 'SaaS Growth Strategy'
        },
        {
          id: '2',
          title: 'Inventory Dead Stock Risk',
          severity: 'high',
          status: 'in-progress',
          category: 'Operations',
          description: 'Potential for significant inventory write-offs due to seasonal demand patterns.',
          confidence: 76,
          createdAt: '1 day ago',
          persona: 'E-commerce',
          scanTitle: 'E-commerce Optimization'
        },
        {
          id: '3',
          title: 'Content Monetization Blind Spot',
          severity: 'medium',
          status: 'resolved',
          category: 'Revenue',
          description: 'Underutilized audience segments that could generate additional revenue streams.',
          confidence: 82,
          createdAt: '3 days ago',
          persona: 'Creator',
          scanTitle: 'Content Creator Analysis'
        },
        {
          id: '4',
          title: 'Compliance Documentation Gap',
          severity: 'high',
          status: 'new',
          category: 'Legal & Compliance',
          description: 'Missing documentation for data privacy compliance in new markets.',
          confidence: 91,
          createdAt: '5 days ago',
          persona: 'Business',
          scanTitle: 'Market Expansion Review'
        },
        {
          id: '5',
          title: 'Team Communication Bottleneck',
          severity: 'medium',
          status: 'in-progress',
          category: 'Operations',
          description: 'Information silos between departments affecting decision-making speed.',
          confidence: 67,
          createdAt: '1 week ago',
          persona: 'Business',
          scanTitle: 'Operational Efficiency Scan'
        }
      ];
      
      setResults(mockResults);
      setFilteredResults(mockResults);
      setLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    let filtered = results.filter(result => {
      const matchesSearch = result.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           result.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSeverity = severityFilter === "all" || result.severity === severityFilter;
      const matchesStatus = statusFilter === "all" || result.status === statusFilter;
      const matchesCategory = categoryFilter === "all" || result.category === categoryFilter;
      
      return matchesSearch && matchesSeverity && matchesStatus && matchesCategory;
    });
    
    setFilteredResults(filtered);
  }, [results, searchTerm, severityFilter, statusFilter, categoryFilter]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'resolved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'in-progress':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'new':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const categories = Array.from(new Set(results.map(r => r.category)));

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-64"></div>
          <div className="flex gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-10 bg-muted rounded w-32"></div>
            ))}
          </div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Blind Spot Results</h1>
          <p className="text-muted-foreground mt-1">
            Analyze and manage your identified blind spots
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </Button>
          <Button variant="outline" size="sm">
            <BarChart3 className="mr-2 h-4 w-4" />
            Analytics
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters & Search</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search blind spots..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severities</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {filteredResults.length} of {results.length} results
          </p>
        </div>

        {filteredResults.map((result) => (
          <Card key={result.id} className="hover-glow cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-3">
                  <div className="flex items-start space-x-3">
                    {getStatusIcon(result.status)}
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="font-semibold text-lg">{result.title}</h3>
                        <Badge className={getSeverityColor(result.severity)}>
                          {result.severity.toUpperCase()}
                        </Badge>
                        <Badge variant="outline">{result.confidence}% confident</Badge>
                      </div>
                      
                      <p className="text-muted-foreground mb-3">
                        {result.description}
                      </p>
                      
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span>{result.category}</span>
                        <span>•</span>
                        <span>{result.persona}</span>
                        <span>•</span>
                        <span>{result.scanTitle}</span>
                        <span>•</span>
                        <span>{result.createdAt}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 ml-4">
                  <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredResults.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Results Found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search criteria or filters to see more results.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}