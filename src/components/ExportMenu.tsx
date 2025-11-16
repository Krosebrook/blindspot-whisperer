import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Download, FileJson, FileSpreadsheet, FileText } from 'lucide-react'
import { botAnalyticsService } from '@/lib/botAnalyticsService'
import { toast } from 'sonner'

export function ExportMenu() {
  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const exportJSON = () => {
    try {
      const data = botAnalyticsService.exportData()
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)
      downloadFile(data, `bot-analytics-${timestamp}.json`, 'application/json')
      toast.success('Analytics data exported as JSON')
    } catch (error) {
      toast.error('Failed to export data')
    }
  }

  const exportCSV = () => {
    try {
      const attempts = botAnalyticsService.getAttempts()
      
      // CSV headers
      const headers = ['ID', 'Timestamp', 'Date', 'Score', 'Confidence', 'Recommendation', 'Triggers', 'False Positive']
      
      // CSV rows
      const rows = attempts.map(a => [
        a.id,
        a.timestamp,
        new Date(a.timestamp).toISOString(),
        a.score,
        a.confidence,
        a.recommendation,
        `"${a.triggers.join('; ')}"`,
        a.isFalsePositive ? 'Yes' : 'No',
      ])

      const csv = [
        headers.join(','),
        ...rows.map(row => row.join(','))
      ].join('\n')

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)
      downloadFile(csv, `bot-analytics-${timestamp}.csv`, 'text/csv')
      toast.success('Analytics data exported as CSV')
    } catch (error) {
      toast.error('Failed to export data')
    }
  }

  const exportPDF = () => {
    // Simple text-based report (proper PDF would require a library)
    try {
      const stats = botAnalyticsService.getStats()
      const thresholds = botAnalyticsService.getThresholds()
      const attempts = botAnalyticsService.getAttempts()

      const report = `
BOT ANALYTICS REPORT
Generated: ${new Date().toLocaleString()}

=================================
SUMMARY STATISTICS
=================================
Total Attempts: ${stats.total}
Average Bot Score: ${stats.avgScore}
Average Confidence: ${stats.avgConfidence}%

Allowed: ${stats.allowedCount} (${((stats.allowedCount / stats.total) * 100).toFixed(1)}%)
Challenged: ${stats.challengedCount} (${((stats.challengedCount / stats.total) * 100).toFixed(1)}%)
Blocked: ${stats.blockedCount} (${((stats.blockedCount / stats.total) * 100).toFixed(1)}%)

False Positives: ${stats.falsePositiveCount} (${stats.falsePositiveRate}%)

=================================
CURRENT THRESHOLDS
=================================
Challenge Threshold: ${thresholds.challenge}
Block Threshold: ${thresholds.block}

=================================
RECENT ATTEMPTS (Last 20)
=================================
${attempts.slice(-20).reverse().map(a => 
  `${new Date(a.timestamp).toLocaleString()} | Score: ${a.score} | ${a.recommendation.toUpperCase()} | ${a.isFalsePositive ? '[FALSE POSITIVE]' : ''}`
).join('\n')}

End of Report
      `.trim()

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)
      downloadFile(report, `bot-analytics-${timestamp}.txt`, 'text/plain')
      toast.success('Analytics report exported as text file')
    } catch (error) {
      toast.error('Failed to export report')
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export Data
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Export Format</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={exportJSON}>
          <FileJson className="mr-2 h-4 w-4" />
          JSON (Detailed)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportCSV}>
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          CSV (Spreadsheet)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportPDF}>
          <FileText className="mr-2 h-4 w-4" />
          Text Report
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
