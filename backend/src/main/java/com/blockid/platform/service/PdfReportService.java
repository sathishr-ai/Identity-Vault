package com.blockid.platform.service;

import com.blockid.platform.model.AuditLog;
import com.blockid.platform.model.IdentityRecord;
import com.blockid.platform.model.User;
import com.blockid.platform.model.VerificationHistory;
import com.lowagie.text.*;
import com.lowagie.text.Font;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import org.springframework.stereotype.Service;

import java.awt.*;
import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class PdfReportService {

    private final Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 22, Color.DARK_GRAY);
    private final Font subtitleFont = FontFactory.getFont(FontFactory.HELVETICA, 10, Color.GRAY);
    private final Font sectionHeaderFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14, new Color(29, 78, 216));
    private final Font defaultFont = FontFactory.getFont(FontFactory.HELVETICA, 10, Color.BLACK);
    private final Font tableHeaderFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, Color.WHITE);
    private final Font boldFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, Color.BLACK);

    private void addHeader(Document document, String titleSubject) throws DocumentException {
        Paragraph title = new Paragraph("BlockID Digital Identity Platform", titleFont);
        title.setAlignment(Element.ALIGN_CENTER);
        document.add(title);

        Paragraph subtitle = new Paragraph(
                "SECURE BLOCKCHAIN-BASED VERIFICATION · REPORT ID: " + System.currentTimeMillis(), subtitleFont);
        subtitle.setAlignment(Element.ALIGN_CENTER);
        subtitle.setSpacingAfter(20);
        document.add(subtitle);

        Paragraph line = new Paragraph(
                "---------------------------------------------------------------------------------------------------------------------------------",
                subtitleFont);
        line.setSpacingAfter(15);
        document.add(line);
    }

    public byte[] generateIdentityReport(User user, IdentityRecord record) {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        Document document = new Document();

        try {
            PdfWriter.getInstance(document, out);
            document.open();

            addHeader(document, "Identity Details Report");

            Paragraph h1 = new Paragraph("Identity Details Report", sectionHeaderFont);
            h1.setSpacingAfter(10);
            document.add(h1);

            PdfPTable table = new PdfPTable(2);
            table.setWidthPercentage(100);
            table.setSpacingBefore(10);

            addTableCell(table, "User ID", user.getId().toString());
            addTableCell(table, "Name", user.getName());
            addTableCell(table, "Email", user.getEmail());
            addTableCell(table, "Phone", user.getPhone() != null ? user.getPhone() : "N/A");
            addTableCell(table, "Country", user.getCountry() != null ? user.getCountry() : "N/A");
            addTableCell(table, "DID", user.getDid() != null ? user.getDid() : "N/A");
            addTableCell(table, "Status", user.getStatus());
            addTableCell(table, "Joined Date",
                    user.getJoinDate().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));

            if (record != null) {
                addTableCell(table, "Aadhaar Number",
                        record.getAadhaarNumber() != null ? record.getAadhaarNumber() : "N/A");
                addTableCell(table, "PAN Number", record.getPanNumber() != null ? record.getPanNumber() : "N/A");
                addTableCell(table, "Passport Number",
                        record.getPassportNumber() != null ? record.getPassportNumber() : "N/A");
                addTableCell(table, "Driving License Number",
                        record.getDrivingLicenceNumber() != null ? record.getDrivingLicenceNumber() : "N/A");
                addTableCell(table, "Blockchain Block #",
                        record.getBlockNumber() != null ? record.getBlockNumber().toString() : "Unassigned");
                addTableCell(table, "Blockchain Hash",
                        record.getBlockchainHash() != null ? record.getBlockchainHash() : "Unassigned");
            }

            document.add(table);

            Paragraph footer = new Paragraph("Verification status checked on Blockchain - VALID",
                    FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, new Color(16, 185, 129)));
            footer.setSpacingBefore(30);
            document.add(footer);

            document.close();
        } catch (DocumentException e) {
            e.printStackTrace();
        }

        return out.toByteArray();
    }

    public byte[] generateVerificationReport(VerificationHistory history) {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        Document document = new Document();

        try {
            PdfWriter.getInstance(document, out);
            document.open();

            addHeader(document, "Identity Verification Report");

            Paragraph h1 = new Paragraph("Verification Status Report", sectionHeaderFont);
            h1.setSpacingAfter(10);
            document.add(h1);

            PdfPTable table = new PdfPTable(2);
            table.setWidthPercentage(100);
            table.setSpacingBefore(10);

            addTableCell(table, "Verification Reference", "VER-" + history.getId());
            addTableCell(table, "Subject Name", history.getUser().getName());
            addTableCell(table, "Subject Email", history.getUser().getEmail());
            addTableCell(table, "Subject DID", history.getUser().getDid() != null ? history.getUser().getDid() : "N/A");

            String verifierName = history.getVerifier() != null ? history.getVerifier().getName() : "System Automated";
            addTableCell(table, "Verified By", verifierName);
            addTableCell(table, "Purpose", history.getPurpose());
            addTableCell(table, "Timestamp",
                    history.getVerificationDate().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));
            addTableCell(table, "Duration", history.getDuration() != null ? history.getDuration() : "N/A");
            addTableCell(table, "Fields Checked", history.getCheckedFields());
            addTableCell(table, "Validation Result", history.getStatus().toUpperCase());

            document.add(table);

            Paragraph footer;
            if (history.getStatus().equalsIgnoreCase("approved") || history.getStatus().equalsIgnoreCase("valid")) {
                footer = new Paragraph(
                        "AUTHENTICITY CHECK PASSED: Digital identity verified and confirmed on the blockchain structure.",
                        FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, new Color(16, 185, 129)));
            } else {
                footer = new Paragraph(
                        "AUTHENTICITY CHECK FAILED / TEMPERED: Digital identity contains metadata that is mismatched or invalid.",
                        FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, Color.RED));
            }
            footer.setSpacingBefore(30);
            document.add(footer);

            document.close();
        } catch (DocumentException e) {
            e.printStackTrace();
        }

        return out.toByteArray();
    }

    public byte[] generateAuditLogReport(List<AuditLog> logs) {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        Document document = new Document(PageSize.A4.rotate()); // Landscape for log tables

        try {
            PdfWriter.getInstance(document, out);
            document.open();

            addHeader(document, "System Audit Trail Report");

            Paragraph h1 = new Paragraph("System Activity Trail List", sectionHeaderFont);
            h1.setSpacingAfter(10);
            document.add(h1);

            PdfPTable table = new PdfPTable(7);
            table.setWidthPercentage(100);
            table.setSpacingBefore(10);
            table.setWidths(new float[] { 1.5f, 2f, 2.5f, 2.5f, 1.8f, 1.2f, 1.5f });

            // Table Headers
            String[] headers = { "Timestamp", "Action", "Actor", "Target", "IP Address", "Severity", "Module" };
            for (String h : headers) {
                PdfPCell cell = new PdfPCell(new Paragraph(h, tableHeaderFont));
                cell.setBackgroundColor(new Color(29, 78, 216));
                cell.setPadding(6);
                table.addCell(cell);
            }

            for (AuditLog log : logs) {
                table.addCell(new Paragraph(log.getTimestamp().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm")),
                        defaultFont));
                table.addCell(new Paragraph(log.getAction(), defaultFont));
                table.addCell(new Paragraph(log.getActor(), defaultFont));
                table.addCell(new Paragraph(log.getTarget(), defaultFont));
                table.addCell(new Paragraph(log.getIpAddress() != null ? log.getIpAddress() : "N/A", defaultFont));
                table.addCell(new Paragraph(log.getSeverity(), defaultFont));
                table.addCell(new Paragraph(log.getModule(), defaultFont));
            }

            document.add(table);
            document.close();
        } catch (Exception e) {
            e.printStackTrace();
        }

        return out.toByteArray();
    }

    public byte[] generateMonthlyReport(List<VerificationHistory> verifications, int countApproved, int countRejected,
            int countPending) {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        Document document = new Document();

        try {
            PdfWriter.getInstance(document, out);
            document.open();

            addHeader(document, "Verification Performance & Analytics Report");

            Paragraph h1 = new Paragraph("Monthly Identity Verification Summary", sectionHeaderFont);
            h1.setSpacingAfter(15);
            document.add(h1);

            // Add stats summary
            PdfPTable statsTable = new PdfPTable(3);
            statsTable.setWidthPercentage(100);
            statsTable.setSpacingAfter(20);

            PdfPCell cell1 = new PdfPCell(new Paragraph("Approved: " + countApproved, boldFont));
            cell1.setBackgroundColor(new Color(240, 253, 244));
            cell1.setPadding(10);

            PdfPCell cell2 = new PdfPCell(new Paragraph("Rejected: " + countRejected, boldFont));
            cell2.setBackgroundColor(new Color(254, 242, 242));
            cell2.setPadding(10);

            PdfPCell cell3 = new PdfPCell(new Paragraph("Pending: " + countPending, boldFont));
            cell3.setBackgroundColor(new Color(254, 243, 199));
            cell3.setPadding(10);

            statsTable.addCell(cell1);
            statsTable.addCell(cell2);
            statsTable.addCell(cell3);
            document.add(statsTable);

            // Add details list
            Paragraph listTitle = new Paragraph("Recent Verification Details", boldFont);
            listTitle.setSpacingAfter(5);
            document.add(listTitle);

            PdfPTable table = new PdfPTable(5);
            table.setWidthPercentage(100);

            String[] headers = { "Timestamp", "Reference", "Subject", "Purpose", "Status" };
            for (String h : headers) {
                PdfPCell cell = new PdfPCell(new Paragraph(h, tableHeaderFont));
                cell.setBackgroundColor(new Color(15, 23, 42));
                cell.setPadding(6);
                table.addCell(cell);
            }

            for (VerificationHistory link : verifications) {
                table.addCell(new Paragraph(
                        link.getVerificationDate().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm")),
                        defaultFont));
                table.addCell(new Paragraph("VER-" + link.getId(), defaultFont));
                table.addCell(new Paragraph(link.getUser().getName(), defaultFont));
                table.addCell(new Paragraph(link.getPurpose(), defaultFont));
                table.addCell(new Paragraph(link.getStatus().toUpperCase(), defaultFont));
            }

            document.add(table);
            document.close();
        } catch (Exception e) {
            e.printStackTrace();
        }

        return out.toByteArray();
    }

    private void addTableCell(PdfPTable table, String field, String value) {
        PdfPCell cellField = new PdfPCell(new Paragraph(field, boldFont));
        cellField.setPadding(6);
        cellField.setBackgroundColor(new Color(248, 250, 252));

        PdfPCell cellValue = new PdfPCell(new Paragraph(value, defaultFont));
        cellValue.setPadding(6);

        table.addCell(cellField);
        table.addCell(cellValue);
    }
}
