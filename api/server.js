const express = require('express');
const cors = require('cors');
const path = require('path');
// Use the already generated Prisma client from the parent directory
const { PrismaClient } = require('../generated/prisma');

const app = express();
// Initialize Prisma with debug logging
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});
const PORT = 3001; // Explicitly set port to 3001

// Middleware
app.use(cors());
app.use(express.json());

// Routes

// Get all case laws with pagination and filtering
app.get('/api/case-laws', async (req, res) => {
  try {
    console.log('GET /api/case-laws request received:', req.query);
    const {
      page = 1,
      limit = 10,
      search = '',
      category = '',
      taxSection = ''
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);
    
    console.log('Pagination params:', { skip, take, page, limit });

    // Build where clause
    const where = {};
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    if (category && category !== 'all') {
      where.category = category;
    }
    
    if (taxSection && taxSection !== 'all') {
      where.taxSection = taxSection;
    }
    
    console.log('Where clause:', JSON.stringify(where));

    try {
      // Get case laws with pagination
      const caseLaws = await prisma.caseLaw.findMany({
        where,
        skip,
        take,
        orderBy: {
          createdAt: 'desc'
        },
        include: {
          caseDetail: true
        }
      });
      
      console.log(`Found ${caseLaws.length} case laws`);

      // Get total count for pagination
      const totalCount = await prisma.caseLaw.count({ where });
      console.log('Total count:', totalCount);

      res.json({
        caseLaws,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalCount / take),
          totalCount,
          hasNext: skip + take < totalCount,
          hasPrev: parseInt(page) > 1
        }
      });
    } catch (prismaError) {
      console.error('Prisma Error:', prismaError);
      res.status(500).json({ error: 'Database query error', details: prismaError.message });
    }
  } catch (error) {
    console.error('Error fetching case laws:', error);
    res.status(500).json({ error: 'Failed to fetch case laws' });
  }
});

// Get case law by TID
app.get('/api/case-laws/:tid', async (req, res) => {
  try {
    const { tid } = req.params;
    const tidNumber = parseInt(tid, 10);

    console.log(`Fetching case law with TID: ${tidNumber}`);

    // First check if the case law exists
    const existingCase = await prisma.caseLaw.findFirst({
      where: { tid: tidNumber }
    });

    if (!existingCase) {
      console.log(`Case law with TID ${tidNumber} not found`);
      return res.status(404).json({ error: 'Case law not found' });
    }

    // Then fetch with the detail
    const caseLaw = await prisma.caseLaw.findUnique({
      where: { tid: tidNumber },
      include: {
        caseDetail: true
      }
    });

    // If somehow it didn't fetch correctly
    if (!caseLaw) {
      console.log(`Failed to retrieve case law with TID ${tidNumber}`);
      return res.status(404).json({ error: 'Case law not found' });
    }

    console.log(`Successfully retrieved case with TID ${tidNumber}`);
    res.json(caseLaw);
  } catch (error) {
    console.error('Error fetching case law:', error);
    console.error(error.stack);
    res.status(500).json({ error: 'Failed to fetch case law', details: error.message });
  }
});

// Get case laws count by category
app.get('/api/case-laws/stats/count', async (req, res) => {
  try {
    const totalCount = await prisma.caseLaw.count();
    
    const categoryStats = await prisma.caseLaw.groupBy({
      by: ['category'],
      _count: {
        category: true
      }
    });

    const taxSectionStats = await prisma.caseLaw.groupBy({
      by: ['taxSection'],
      _count: {
        taxSection: true
      }
    });

    res.json({
      total: totalCount,
      byCategory: categoryStats.reduce((acc, item) => {
        acc[item.category] = item._count.category;
        return acc;
      }, {}),
      byTaxSection: taxSectionStats.reduce((acc, item) => {
        acc[item.taxSection] = item._count.taxSection;
        return acc;
      }, {})
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// Search case laws
app.get('/api/case-laws/search/:query', async (req, res) => {
  try {
    console.log('Search API called with query:', req.params.query);
    const { query } = req.params;
    const { page = 1, limit = 20 } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);
    
    console.log('Search params:', { query, page, limit, skip, take });

    // Define search where clause
    const searchWhere = {
      OR: [
        { title: { contains: query, mode: 'insensitive' } },
        { headline: { contains: query, mode: 'insensitive' } } // Use headline instead of description
      ]
    };
    
    const caseLaws = await prisma.caseLaw.findMany({
      where: searchWhere,
      skip,
      take,
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        caseDetail: true // Fix: use caseDetail instead of details
      }
    });
    
    // Get total count of matching records for pagination
    const totalCount = await prisma.caseLaw.count({
      where: searchWhere
    });
    
    console.log(`Found ${caseLaws.length} results out of ${totalCount} total matches`);

    // Return with pagination info
    res.json({
      caseLaws,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / take),
        totalCount,
        hasNext: skip + take < totalCount,
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Error searching case laws:', error);
    console.error(error.stack);
    res.status(500).json({ error: 'Failed to search case laws', details: error.message });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'E-Library API is running' });
});

// Test database connection endpoint
app.get('/api/test-db', async (req, res) => {
  try {
    // Test database connection by counting case laws
    const count = await prisma.caseLaw.count();
    res.json({ 
      status: 'OK', 
      message: 'Database connection successful', 
      count,
      models: Object.keys(prisma) 
    });
  } catch (error) {
    console.error('Database connection test failed:', error);
    res.status(500).json({ 
      status: 'ERROR', 
      message: 'Database connection failed', 
      error: error.message,
      stack: error.stack
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Mock data endpoint as a fallback
app.get('/api/case-laws/mock', (req, res) => {
  const mockData = {
    caseLaws: [
      {
        id: 'mock-1',
        tid: 1001,
        title: 'Mock Case Law 1',
        headline: 'This is a mock case for testing',
        docsource: 'Mock Source',
        numcitedby: 10,
        numcites: 5,
        publishdate: '2024-01-15',
        category: 'GST',
        taxSection: 'SECTION_7_GST',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'mock-2',
        tid: 1002,
        title: 'Mock Case Law 2',
        headline: 'Another mock case for testing',
        docsource: 'Mock Source',
        numcitedby: 8,
        numcites: 3,
        publishdate: '2024-02-20',
        category: 'INCOME_TAX',
        taxSection: 'SECTION_139_IT',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ],
    pagination: {
      currentPage: 1,
      totalPages: 1,
      totalCount: 2,
      hasNext: false,
      hasPrev: false
    }
  };
  
  res.json(mockData);
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 E-Library API server is running on http://localhost:${PORT}`);
  console.log(`📚 Case Laws API: http://localhost:${PORT}/api/case-laws`);
  console.log(`🔍 Search API: http://localhost:${PORT}/api/case-laws/search/{query}`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('🛑 Shutting down server...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('🛑 Shutting down server...');
  await prisma.$disconnect();
  process.exit(0);
});
