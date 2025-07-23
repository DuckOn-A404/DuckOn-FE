package com.a404.duckonback.service;

import com.a404.duckonback.entity.Report;
import com.a404.duckonback.enums.ReportStatus;
import com.a404.duckonback.enums.ReportType;

import java.util.List;
import java.util.Optional;

public interface ReportService {
    Report createReport(Report report);
    Optional<Report> getReportById(Long reportId);
    List<Report> getAllReports();
    Report updateReport(Long reportId, Report updatedReport);
    void deleteReport(Long reportId);

    List<Report> getReportsByReporter(String uuid);
    List<Report> getReportsByReported(String uuid);
    List<Report> getReportsByStatus(ReportStatus status);
    List<Report> getReportsByType(ReportType type);
}
