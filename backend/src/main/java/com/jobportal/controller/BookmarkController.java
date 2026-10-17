package com.jobportal.controller;

import com.jobportal.model.Bookmark;
import com.jobportal.security.services.UserDetailsImpl;
import com.jobportal.service.BookmarkService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/bookmarks")
public class BookmarkController {

    @Autowired
    private BookmarkService bookmarkService;

    @PostMapping("/{jobId}")
    @PreAuthorize("hasRole('JOB_SEEKER')")
    public Bookmark toggleBookmark(@PathVariable String jobId) {
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return bookmarkService.toggleBookmark(userDetails.getId(), jobId);
    }

    @GetMapping
    @PreAuthorize("hasRole('JOB_SEEKER')")
    public List<Bookmark> getMyBookmarks() {
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return bookmarkService.getBookmarksByUser(userDetails.getId());
    }
}
