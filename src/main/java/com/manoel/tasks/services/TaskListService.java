package com.manoel.tasks.services;

import com.manoel.tasks.domain.entities.TaskList;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface TaskListService {
    List<TaskList> listTaskLists();
    TaskList createTaskList(TaskList taskList);
    Optional<TaskList> getTaskList(UUID id);
<<<<<<< HEAD
    TaskList updateTaskList(UUID taskListId, TaskList taskList);
    void deleteTaskList(UUID taskListId);

=======
>>>>>>> 2692ac9d45e0e0b96bcb9d5638e0974d388c5a30
}
