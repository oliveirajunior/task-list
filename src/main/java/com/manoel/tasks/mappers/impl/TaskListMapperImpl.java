package com.manoel.tasks.mappers.impl;

import com.manoel.tasks.domain.dto.TaskListDto;
import com.manoel.tasks.domain.entities.Task;
import com.manoel.tasks.domain.entities.TaskList;
import com.manoel.tasks.domain.entities.TaskStatus;
import com.manoel.tasks.mappers.TaskListMapper;
import com.manoel.tasks.mappers.TaskMapper;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class TaskListMapperImpl implements TaskListMapper {

    private final TaskMapper taskMapper;

    public TaskListMapperImpl(TaskMapper taskMapper) {
        this.taskMapper = taskMapper;
    }


    @Override
    public TaskList fromDto(TaskListDto taskListDto) {
        return new TaskList(
                taskListDto.id(),
                taskListDto.title(),
                taskListDto.description(),
                taskListDto.tasks().stream().map(taskMapper::fromDto).toList(),
                null,
                null
        );
    }

    @Override
    public TaskListDto toDto(TaskList taskList) {
        return new TaskListDto(
                taskList.getId(),
                taskList.getTitle(),
                taskList.getDescription(),
                //caution here!! 01:15:13
                taskList.getTasks().stream().toList().size(),
                calculateTaskListProgress(taskList.getTasks()),
                //caution here!! 01:17:41
                taskList.getTasks().stream().map(taskMapper::toDto).toList()
        );
    }

    private Double calculateTaskListProgress(List<Task> tasks){
        if(tasks == null){
            return null;
        }
        long closedTaskCount = tasks.stream().filter(task -> task.getStatus() == TaskStatus.CLOSED).count();

        return (double) closedTaskCount / tasks.size();
    }
}
