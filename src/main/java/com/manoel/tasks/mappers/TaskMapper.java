package com.manoel.tasks.mappers;

import com.manoel.tasks.domain.dto.TaskDto;
import com.manoel.tasks.domain.entities.Task;

public interface TaskMapper {

    //Change DTO into Entity
    Task fromDto(TaskDto taskDto);

    //Change Entity into DTO
    TaskDto toDto(Task task);
}
