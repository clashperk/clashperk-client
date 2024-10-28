import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { CSSProperties, useEffect, useState } from 'react';
import {
  DragDropContext,
  Draggable,
  DraggingStyle,
  Droppable,
  NotDraggingStyle,
  OnDragEndResponder
} from 'react-beautiful-dnd';
import { ClanGroup } from './ClansPage';

function reorder<T>(list: T[], startIndex: number, endIndex: number): T[] {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
}

const getItemStyle = (
  isDragging: boolean,
  draggableStyle?: DraggingStyle | NotDraggingStyle
): CSSProperties => ({
  // some basic styles to make the items look a bit nicer
  userSelect: 'none',
  padding: '8px',
  margin: '4px',
  borderRadius: '10px',
  fontWeight: 600,

  // change background color if dragging
  background: isDragging ? '#212121' : '#121212',

  // styles we need to apply on draggables
  ...draggableStyle
});

const getListStyle = (isDraggingOver: boolean): CSSProperties => ({
  background: isDraggingOver ? '#31343a' : 'transparent',
  padding: '4px',
  width: '100%',
  borderRadius: '10px'
});

const getInnerItemStyle = (
  isDragging: boolean,
  draggableStyle?: DraggingStyle | NotDraggingStyle
): CSSProperties => ({
  // some basic styles to make the items look a bit nicer
  userSelect: 'none',
  padding: '8px',
  margin: '4px',
  borderRadius: '10px',
  fontWeight: 600,

  // change background color if dragging
  background: isDragging ? '#212121' : '#121212',

  // styles we need to apply on draggables
  ...draggableStyle
});

const getInnerListStyle = (isDraggingOver: boolean): CSSProperties => ({
  background: isDraggingOver ? '#31343a' : '#221f1f',
  padding: '4px',
  width: '100%',
  borderRadius: '10px'
});

export function DragSystem({
  clanGroup,
  onReordered
}: {
  clanGroup: ClanGroup;
  onReordered: (payload: any) => unknown;
}) {
  const [groups, setGroups] = useState(clanGroup.grouped);
  useEffect(() => {
    setGroups(clanGroup.grouped);
  }, [clanGroup.grouped]);

  const onDragEnd: OnDragEndResponder = (result) => {
    if (!result.destination) return;

    const sourceIndex = result.source.index;
    const destIndex = result.destination.index;
    if (result.type === 'droppableItem') {
      const newItems = reorder(groups, sourceIndex, destIndex);
      setGroups(newItems);
      onReordered(newItems);
    } else if (result.type === 'droppableSubItem') {
      const itemSubItemMap = groups.reduce<Record<string, any[]>>(
        (acc, item) => {
          acc[item._id] = item.clans;
          return acc;
        },
        {}
      );

      const sourceParentId = result.source.droppableId;
      const destParentId = result.destination.droppableId;

      const sourceSubItems = itemSubItemMap[sourceParentId];
      const destSubItems = itemSubItemMap[destParentId];

      let newItems = [...groups];

      /** In this case clans are reordered inside same Parent */
      if (sourceParentId === destParentId) {
        const reorderedSubItems = reorder(
          sourceSubItems,
          sourceIndex,
          destIndex
        );
        newItems = newItems.map((item) => {
          if (item._id === sourceParentId) {
            item.clans = reorderedSubItems;
          }
          return item;
        });
        setGroups(newItems);
      } else {
        let newSourceSubItems = [...sourceSubItems];
        const [draggedItem] = newSourceSubItems.splice(sourceIndex, 1);

        let newDestSubItems = [...destSubItems];
        newDestSubItems.splice(destIndex, 0, draggedItem);
        newItems = newItems.map((item) => {
          if (item._id === sourceParentId) {
            item.clans = newSourceSubItems;
          } else if (item._id === destParentId) {
            item.clans = newDestSubItems;
          }
          return item;
        });
        setGroups(newItems);
      }

      onReordered(newItems);
    }
  };

  return (
    <>
      <Stack direction={{ sx: 'column', md: 'row' }} spacing={1}>
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="droppable" type="droppableItem">
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                style={getListStyle(snapshot.isDraggingOver)}
              >
                {groups.map((group, index) => (
                  <Draggable
                    key={group._id}
                    draggableId={group._id}
                    index={index}
                    isDragDisabled={group._id === 'general'}
                  >
                    {(provided, snapshot) => (
                      <>
                        <Box
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          style={getItemStyle(
                            snapshot.isDragging,
                            provided.draggableProps.style
                          )}
                        >
                          <Stack
                            direction="row"
                            color="#00b0f4"
                            justifyContent="space-between"
                            spacing={1}
                            alignItems="center"
                            pb={1.5}
                          >
                            <Typography
                              pl={1}
                              variant="body2"
                              color="#00b0f4"
                              fontWeight={600}
                              lineHeight={2}
                            >
                              {group._id === 'general'
                                ? 'Un-categorized'
                                : group.name}
                            </Typography>

                            <Typography
                              pr={1}
                              fontSize="5px"
                              pt={0.5}
                              {...provided.dragHandleProps}
                            >
                              <DragIndicatorIcon sx={{ opacity: 0.7 }} />
                            </Typography>
                          </Stack>

                          {/*  */}

                          <Droppable
                            droppableId={group._id}
                            type="droppableSubItem"
                          >
                            {(provided, snapshot) => (
                              <Box
                                ref={provided.innerRef}
                                style={getInnerListStyle(
                                  snapshot.isDraggingOver
                                )}
                              >
                                {group.clans.map((clan, index) => (
                                  <Draggable
                                    key={clan._id}
                                    draggableId={clan._id}
                                    index={index}
                                  >
                                    {(provided, snapshot) => (
                                      <Stack
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        style={getInnerItemStyle(
                                          snapshot.isDragging,
                                          provided.draggableProps.style
                                        )}
                                        direction="row"
                                        spacing={1}
                                        justifyContent="space-between"
                                        alignItems="center"
                                      >
                                        <Typography
                                          pl={1}
                                          variant="body2"
                                          fontWeight={600}
                                          lineHeight={2}
                                        >
                                          {clan.name} ({clan.tag})
                                        </Typography>

                                        <Typography
                                          pr={1}
                                          fontSize="10px"
                                          pt={0.5}
                                          {...provided.dragHandleProps}
                                        >
                                          <DragIndicatorIcon
                                            sx={{ opacity: 0.6 }}
                                          />
                                        </Typography>
                                      </Stack>
                                    )}
                                  </Draggable>
                                ))}
                                {provided.placeholder}
                              </Box>
                            )}
                          </Droppable>
                          {/*  */}
                        </Box>
                      </>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </Stack>
    </>
  );
}
