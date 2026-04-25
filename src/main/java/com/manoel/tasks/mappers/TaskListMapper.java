package com.manoel.tasks.mappers;

import com.manoel.tasks.domain.dto.TaskListDto;
import com.manoel.tasks.domain.entities.TaskList;

public interface TaskListMapper {

    TaskList fromDto(TaskListDto taskListDto);

    TaskListDto toDto(TaskList taskList);
}
