package com.manoel.tasks.domain.dto;

import com.manoel.tasks.domain.entities.TaskPriority;
import com.manoel.tasks.domain.entities.TaskStatus;

import java.time.LocalDateTime;
import java.util.UUID;

public record TaskDto(
        UUID id,
        String title,
        String description,
        LocalDateTime dueDate,
        TaskStatus taskStatus, TaskPriority priority,
        TaskStatus status,
        //Because TaskMapperImpl
        Object o, Object object) {
}
