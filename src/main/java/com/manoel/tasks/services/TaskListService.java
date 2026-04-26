package com.manoel.tasks.services;

import com.manoel.tasks.domain.dto.TaskListDto;
import com.manoel.tasks.domain.entities.TaskList;

import java.util.List;

public interface TaskListService {
    List<TaskList> listTaskLists();
    TaskList createTaskList(TaskList taskList);
}
