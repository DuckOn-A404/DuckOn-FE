package com.a404.duckonback.service;

import com.a404.duckonback.entity.Report;
import com.a404.duckonback.entity.User;
import com.a404.duckonback.enums.ReportStatus;
import com.a404.duckonback.enums.ReportType;
import com.a404.duckonback.repository.ReportRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;

import java.time.LocalDateTime;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class ReportServiceImplTest {

    @Mock
    private ReportRepository reportRepository;

    @InjectMocks
    private ReportServiceImpl reportService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    private Report getMockReport() {
        return Report.builder()
                .reportId(1L)
                .reportStatus(ReportStatus.PENDING)
                .reportType(ReportType.MESSAGE)
                .reportReason("부적절한 채팅")
                .reportedContent("욕설 포함")
                .reported(User.builder().uuid("reported-uuid").build())
                .reporter(User.builder().uuid("reporter-uuid").build())
                .reportedAt(LocalDateTime.now())
                .build();
    }

    @Test
    void createReport_shouldReturnSavedReport() {
        Report report = getMockReport();
        when(reportRepository.save(any(Report.class))).thenReturn(report);

        Report saved = reportService.createReport(report);

        assertNotNull(saved);
        assertEquals(ReportStatus.PENDING, saved.getReportStatus());
        verify(reportRepository).save(report);
    }

    @Test
    void getReportById_shouldReturnReport() {
        Report report = getMockReport();
        when(reportRepository.findById(report.getReportId())).thenReturn(Optional.of(report));

        Optional<Report> result = reportService.getReportById(report.getReportId());

        assertTrue(result.isPresent());
        assertEquals(report.getReportId(), result.get().getReportId());
    }

    @Test
    void getAllReports_shouldReturnList() {
        when(reportRepository.findAll()).thenReturn(List.of(getMockReport()));

        List<Report> result = reportService.getAllReports();

        assertEquals(1, result.size());
        verify(reportRepository).findAll();
    }

    @Test
    void updateReport_shouldUpdateFields() {
        Report existing = getMockReport();
        Report updated = getMockReport();
        updated.setReportStatus(ReportStatus.APPROVED);

        when(reportRepository.findById(existing.getReportId())).thenReturn(Optional.of(existing));
        when(reportRepository.save(any(Report.class))).thenReturn(updated);

        Report result = reportService.updateReport(existing.getReportId(), updated);

        assertEquals(ReportStatus.APPROVED, result.getReportStatus());
        verify(reportRepository).save(any(Report.class));
    }

    @Test
    void deleteReport_shouldCallDeleteById() {
        Long id = 1L;

        doNothing().when(reportRepository).deleteById(id);

        reportService.deleteReport(id);

        verify(reportRepository).deleteById(id);
    }

    @Test
    void getReportsByReporter_shouldReturnList() {
        when(reportRepository.findByReporter_Uuid("reporter-uuid")).thenReturn(List.of(getMockReport()));

        List<Report> result = reportService.getReportsByReporter("reporter-uuid");

        assertEquals(1, result.size());
        verify(reportRepository).findByReporter_Uuid("reporter-uuid");
    }

    @Test
    void getReportsByReported_shouldReturnList() {
        when(reportRepository.findByReported_Uuid("reported-uuid")).thenReturn(List.of(getMockReport()));

        List<Report> result = reportService.getReportsByReported("reported-uuid");

        assertEquals(1, result.size());
        verify(reportRepository).findByReported_Uuid("reported-uuid");
    }

    @Test
    void getReportsByStatus_shouldReturnList() {
        when(reportRepository.findByReportStatus(ReportStatus.PENDING)).thenReturn(List.of(getMockReport()));

        List<Report> result = reportService.getReportsByStatus(ReportStatus.PENDING);

        assertEquals(1, result.size());
        verify(reportRepository).findByReportStatus(ReportStatus.PENDING);
    }

    @Test
    void getReportsByType_shouldReturnList() {
        when(reportRepository.findByReportType(ReportType.MESSAGE)).thenReturn(List.of(getMockReport()));

        List<Report> result = reportService.getReportsByType(ReportType.MESSAGE);

        assertEquals(1, result.size());
        verify(reportRepository).findByReportType(ReportType.MESSAGE);
    }
}
