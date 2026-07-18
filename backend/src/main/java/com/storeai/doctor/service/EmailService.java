package com.storeai.doctor.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:noreply@storeai.doctor}")
    private String fromEmail;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    @Async
    public void sendWelcomeEmail(String to, String name) {
        try {
            log.info("[EMAIL] Welcome email to: {}, name: {}", to, name);

            // MVP: log only, do not actually send
            log.info("[EMAIL] Subject: Welcome to StoreAI Doctor!");
            log.info("[EMAIL] Body: Hi {}, welcome to StoreAI Doctor! Your account has been created successfully.", name);

            // Production implementation (uncomment when SMTP is configured):
            // MimeMessage message = mailSender.createMimeMessage();
            // MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            // helper.setFrom(fromEmail);
            // helper.setTo(to);
            // helper.setSubject("Welcome to StoreAI Doctor!");
            // helper.setText("Hi " + name + ",\n\nWelcome to StoreAI Doctor! "
            //     + "Your account has been created successfully.\n\n"
            //     + "Start by connecting your Shopify store and uploading your first order CSV.\n\n"
            //     + "Best regards,\nStoreAI Doctor Team", false);
            // mailSender.send(message);
        } catch (Exception e) {
            log.error("[EMAIL] Failed to send welcome email to: {}", to, e);
        }
    }

    @Async
    public void sendPaymentSuccessEmail(String to, String plan) {
        try {
            log.info("[EMAIL] Payment success email to: {}, plan: {}", to, plan);

            // MVP: log only, do not actually send
            log.info("[EMAIL] Subject: Payment Successful - {} Plan Activated", plan);
            log.info("[EMAIL] Body: Hi, your payment for the {} plan was successful. Your subscription is now active.", plan);

            // Production implementation (uncomment when SMTP is configured):
            // MimeMessage message = mailSender.createMimeMessage();
            // MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            // helper.setFrom(fromEmail);
            // helper.setTo(to);
            // helper.setSubject("Payment Successful - " + plan + " Plan Activated");
            // helper.setText("Hi,\n\nYour payment for the " + plan + " plan was successful. "
            //     + "Your subscription is now active.\n\n"
            //     + "Thank you for choosing StoreAI Doctor!\n\n"
            //     + "Best regards,\nStoreAI Doctor Team", false);
            // mailSender.send(message);
        } catch (Exception e) {
            log.error("[EMAIL] Failed to send payment success email to: {}", to, e);
        }
    }

    @Async
    public void sendExpiryReminderEmail(String to, String plan, LocalDateTime expireTime) {
        try {
            String formattedExpireTime = expireTime.format(DateTimeFormatter.ISO_LOCAL_DATE_TIME);
            log.info("[EMAIL] Expiry reminder email to: {}, plan: {}, expireTime: {}", to, plan, formattedExpireTime);

            // MVP: log only, do not actually send
            log.info("[EMAIL] Subject: Your {} Plan Expires Soon", plan);
            log.info("[EMAIL] Body: Hi, your {} plan will expire on {}. Please renew to continue enjoying premium features.", plan, formattedExpireTime);

            // Production implementation (uncomment when SMTP is configured):
            // MimeMessage message = mailSender.createMimeMessage();
            // MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            // helper.setFrom(fromEmail);
            // helper.setTo(to);
            // helper.setSubject("Your " + plan + " Plan Expires Soon");
            // helper.setText("Hi,\n\nYour " + plan + " plan will expire on " + formattedExpireTime + ". "
            //     + "Please renew to continue enjoying premium features.\n\n"
            //     + "Best regards,\nStoreAI Doctor Team", false);
            // mailSender.send(message);
        } catch (Exception e) {
            log.error("[EMAIL] Failed to send expiry reminder email to: {}", to, e);
        }
    }
}