import { firestore } from "../firestore/firestore.js";
import { createUID } from "../utils/uid.js";

export const goalData = {
  async createGoal(userId, goalData) {
    const uid = goalData.id ? goalData.id : createUID();
    const path = `users/${userId}/goals/${uid}`;
    await firestore.create(path, goalData);
    return uid;
  },


  async createGoal(userId, goalData, parentId = null) {
    let linkedGoalData = {
      ...goalData,
      parent: parentId,
      children: [] 
    };
  
    const goalId = await firestore.create(`users/${userId}/goals/${linkedGoalData.id}`, linkedGoalData);
  
    if (goalData.children && goalData.children.length > 0) {
      const childIds = await Promise.all(goalData.children.map(childGoalData =>
        this.createGoal(userId, childGoalData, goalId)
      ));
  
      await firestore.update(`users/${userId}/goals/${goalId}`, { children: childIds });
    }
  
    return goalId;
  },

  async getGoal(userId, goalId) {
    const path = `users/${userId}/goals/${goalId}`;
    const goal = await firestore.read(path);
    if (goal.children) {
      goal.children = await Promise.all(
        goal.children.map((childId) => this.getGoal(userId, childId))
      );
    }
    return goal;
  },

  async listGoals(userId) {
    const path = `users/${userId}/goals`;
    return await firestore.list(path);
  },

  async listTopLevelGoals(userId) {
    const path = `users/${userId}/goals`;
    let goals = await firestore.list(path);
    goals = goals.filter((goal) => goal.parent == null);
    for (const goal of goals) {
      if (goal.children) {
        goal.children = await Promise.all(
          goal.children.map((childId) => this.getGoal(userId, childId))
        );
      }
    }
    return goals;
  },

  async updateGoal(userId, goalId, goalData) {
    const path = `users/${userId}/goals/${goalId}`;
    await firestore.update(path, goalData);
  },

  async deleteGoal(userId, goalId) {
    const path = `users/${userId}/goals/${goalId}`;
    await firestore.delete(path);
  },

  async createPlan(userId, goalData) {
    const uid = createUID();
    const path = `users/${userId}/goals/${goalId}/plans/${uid}`;
    await firestore.create(path, goalData);
    return uid;
  },

  async getPlan(userId, goalId, planId) {
    const path = `users/${userId}/goals/${goalId}/plans/${planId}`;
    return await firestore.read(path);
  },

  async listPlans(userId, goalId) {
    const path = `users/${userId}/goals/${goalId}/plans`;
    return await firestore.list(path);
  },

  async updatePlan(userId, goalId, planId, planData) {
    const path = `users/${userId}/goals/${goalId}/plans/${planId}`;
    await firestore.update(path, planData);
  },

  async deletePlan(userId, goalId, planId) {
    const path = `users/${userId}/goals/${goalId}/plans/${planId}`;
    await firestore.delete(path);
  },

  async removeObjectiveFromGoals(userId, objectiveId) {
    await firestore.removeObjectiveFromGoals(userId, objectiveId);
  },

  async updateGoalStatus(userId, goalId, newStatus) {
    const path = `users/${userId}/goals/${goalId}`;
    await firestore.updateField(path, "complete", newStatus);
  },
};
