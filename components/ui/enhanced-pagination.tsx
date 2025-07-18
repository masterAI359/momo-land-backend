"use client"

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface EnhancedPaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  itemsPerPage?: number
  onItemsPerPageChange?: (itemsPerPage: number) => void
  totalItems?: number
  showItemsPerPage?: boolean
  showPageInfo?: boolean
  showTotalInfo?: boolean
  className?: string
}

export const EnhancedPagination = ({
  currentPage,
  totalPages,
  onPageChange,
  itemsPerPage = 10,
  onItemsPerPageChange,
  totalItems,
  showItemsPerPage = false,
  showPageInfo = true,
  showTotalInfo = true,
  className = "",
}: EnhancedPaginationProps) => {
  const generatePageNumbers = () => {
    const pages = []
    const showEllipsis = totalPages > 7
    
    if (showEllipsis) {
      // Always show first page
      pages.push(1)
      
      if (currentPage > 3) {
        pages.push("ellipsis-start")
      }
      
      // Show pages around current page
      const start = Math.max(2, currentPage - 1)
      const end = Math.min(totalPages - 1, currentPage + 1)
      
      for (let i = start; i <= end; i++) {
        pages.push(i)
      }
      
      if (currentPage < totalPages - 2) {
        pages.push("ellipsis-end")
      }
      
      // Always show last page if more than 1 page
      if (totalPages > 1) {
        pages.push(totalPages)
      }
    } else {
      // Show all pages if 7 or less
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    }
    
    return pages
  }

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1)
    }
  }

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1)
    }
  }

  const pageNumbers = generatePageNumbers()

  if (totalPages <= 1) return null

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Page Info */}
      {(showPageInfo || showTotalInfo) && (
        <div className="flex items-center justify-between text-sm text-gray-500">
          {showPageInfo && (
            <div>
              {totalItems && (
                <span>
                  {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, totalItems)} 件目
                </span>
              )}
              {showTotalInfo && totalItems && (
                <span className="ml-2">
                  (全 {totalItems} 件中)
                </span>
              )}
            </div>
          )}
          
          {showItemsPerPage && onItemsPerPageChange && (
            <div className="flex items-center space-x-2">
              <span>表示件数:</span>
              <Select value={itemsPerPage.toString()} onValueChange={(value) => onItemsPerPageChange(parseInt(value))}>
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      )}

      {/* Main Pagination */}
      <Pagination className="justify-center">
        <PaginationContent>
          {/* Previous Button */}
          <PaginationItem>
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrevious}
              disabled={currentPage === 1}
              className="gap-1"
            >
              <ChevronLeft className="h-4 w-4" />
              前へ
            </Button>
          </PaginationItem>

          {/* Page Numbers */}
          {pageNumbers.map((page, index) => (
            <PaginationItem key={index}>
              {page === "ellipsis-start" || page === "ellipsis-end" ? (
                <PaginationEllipsis />
              ) : (
                <PaginationLink
                  href="#"
                  onClick={(e) => {
                    e.preventDefault()
                    onPageChange(page as number)
                  }}
                  isActive={currentPage === page}
                  className={currentPage === page ? "bg-pink-600 text-white hover:bg-pink-700" : ""}
                >
                  {page}
                </PaginationLink>
              )}
            </PaginationItem>
          ))}

          {/* Next Button */}
          <PaginationItem>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNext}
              disabled={currentPage === totalPages}
              className="gap-1"
            >
              次へ
              <ChevronRight className="h-4 w-4" />
            </Button>
          </PaginationItem>
        </PaginationContent>
      </Pagination>

      {/* Quick Jump */}
      <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
        <span>ページ {currentPage} / {totalPages}</span>
      </div>
    </div>
  )
}

// Simple pagination component for basic use cases
export const SimplePagination = ({
  currentPage,
  totalPages,
  onPageChange,
  className = "",
}: {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  className?: string
}) => {
  if (totalPages <= 1) return null

  return (
    <div className={`flex items-center justify-center space-x-2 ${className}`}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        <ChevronLeft className="h-4 w-4" />
        前へ
      </Button>
      
      <div className="flex items-center space-x-1">
        {[...Array(totalPages)].map((_, i) => (
          <Button
            key={i + 1}
            variant={currentPage === i + 1 ? "default" : "outline"}
            size="sm"
            onClick={() => onPageChange(i + 1)}
            className={currentPage === i + 1 ? "bg-pink-600 hover:bg-pink-700" : ""}
          >
            {i + 1}
          </Button>
        ))}
      </div>
      
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        次へ
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )
}

// Mobile-friendly pagination
export const MobilePagination = ({
  currentPage,
  totalPages,
  onPageChange,
  className = "",
}: {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  className?: string
}) => {
  if (totalPages <= 1) return null

  return (
    <div className={`flex items-center justify-between ${className}`}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        <ChevronLeft className="h-4 w-4" />
        前へ
      </Button>
      
      <div className="flex items-center space-x-2">
        <span className="text-sm text-gray-500">
          {currentPage} / {totalPages}
        </span>
      </div>
      
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        次へ
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )
} 