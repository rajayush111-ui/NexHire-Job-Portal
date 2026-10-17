package com.jobportal.service;

import com.jobportal.model.Bookmark;
import com.jobportal.repository.BookmarkRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class BookmarkService {
    @Autowired
    private BookmarkRepository bookmarkRepository;

    public Bookmark toggleBookmark(String userId, String jobId) {
        return bookmarkRepository.findByUserIdAndJobId(userId, jobId)
                .map(b -> {
                    bookmarkRepository.delete(b);
                    return (Bookmark) null;
                })
                .orElseGet(() -> {
                    Bookmark b = new Bookmark();
                    b.setUserId(userId);
                    b.setJobId(jobId);
                    return bookmarkRepository.save(b);
                });
    }

    public List<Bookmark> getBookmarksByUser(String userId) {
        return bookmarkRepository.findByUserId(userId);
    }
}
